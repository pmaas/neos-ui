const yaml = require('js-yaml');
const fs = require('fs');
const isEnvCi = process.env.CI;

function readYaml(path, fileNotFoundMessage) {
    var data = {};

    try {
        data = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    } catch (e) {
        if (e.code === 'ENOENT' && fileNotFoundMessage) {
            // Do not display warnings while running in CI.
            if (!isEnvCi) {
                console.error(fileNotFoundMessage);
            }
        } else {
            throw e;
        }
    }

    return data;
}

const buildConfig = Object.assign(
    readYaml('Build/Selenium/Settings.yaml.example'),
    readYaml('Build/Selenium/Settings.yaml', 'Neos UI: No customized Settings.yaml for selenium was found. This may lead to unexpected problems since we need login credentials for the neos backend.')
).WebdriverIO;
const credentials = buildConfig.credentials;
const config = {
    updateJob: true,
    specs: [
        './Resources/Private/JavaScript/**/*.behavior.js'
    ],
    capabilities: [{
        browserName: 'firefox'
    }],
    logLevel: 'verbose',
    coloredLogs: true,
    screenshotPath: './Build/Selenium/Screenshots/',
    baseUrl: buildConfig.baseUrl,
    waitforTimeout: 60000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    services: ['sauce'],
    framework: 'mocha',
    reporters: ['dot'],
    mochaOpts: {
        ui: 'bdd',
        compilers: ['js:babel-core/register']
    },

    //
    // Automatically log-in into the backend before the testsuite starts.
    //
    before() {
        browser.url(buildConfig.url);
        browser.setValue('#username', credentials.username);
        browser.setValue('#password', credentials.password);
        browser.submitForm('[name="login"]');

        const chai = require('chai');

        expect = chai.expect;
        chai.should();
    }
};

//
// Adjust some settings for CI runs.
//
if (isEnvCi) {
    config.user = process.env.SAUCE_USERNAME;
    config.key = process.env.SAUCE_ACCESS_KEY;

    config.capabilities = [{
        'browserName': 'chrome',
        'platform': 'XP',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': '#' + process.env.TRAVIS_JOB_NUMBER + ' ' + process.env.TRAVIS_REPO_SLUG + ': ' + process.env.COMMIT_MESSAGE,
        'build': process.env.TRAVIS_BUILD_NUMBER
    }];
}

exports.config = config;
