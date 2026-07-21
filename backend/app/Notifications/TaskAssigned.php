<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * TaskAssigned Notification
 *
 * Sent to an intern when a new task is assigned to them.
 * Queued so the admin's task creation is instant.
 */
class TaskAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Task $task
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'      => 'task_assigned',
            'message'   => "You have been assigned a new task: {$this->task->title}",
            'task_id'   => $this->task->id,
            'task_title' => $this->task->title,
            'priority'  => $this->task->priority->value,
            'deadline'  => $this->task->deadline?->toDateString(),
        ];
    }
}