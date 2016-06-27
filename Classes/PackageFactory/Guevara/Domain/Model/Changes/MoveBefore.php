<?php
namespace Neos\Neos\Ui\Domain\Model\Changes;

class MoveBefore extends AbstractMove
{
    /**
     * Applies this change
     *
     * @return void
     */
    public function apply()
    {
        if ($this->canApply()) {
            $this->getSubject()->moveBefore($this->getReference());
            $this->updateWorkspaceInfo();
        }
    }
}
