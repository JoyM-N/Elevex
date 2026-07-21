<?php

namespace App\Notifications;

use App\Models\Logbook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * LogbookStatusChanged Notification
 *
 * Sent to an intern when an admin reviews their logbook.
 * Status can be: approved, rejected, revision_needed.
 *
 * Implements ShouldQueue so it is processed asynchronously
 * by the Redis queue worker — the admin's response is instant
 * and the notification is sent in the background.
 *
 * Stored in the notifications table (database channel)
 * so interns can see their notification history.
 */
class LogbookStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Logbook $logbook,
        private readonly string  $action
    ) {}

    /**
     * Deliver via database only for now.
     * Phase 11 (future): add 'mail' channel here.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Data stored in the notifications table.
     * Accessed via $user->notifications.
     */
    public function toDatabase(object $notifiable): array
    {
        $messages = [
            'approved'        => 'Your logbook entry has been approved.',
            'rejected'        => 'Your logbook entry has been rejected. Please check the feedback.',
            'revision_needed' => 'Your logbook entry needs revision. Please check the feedback.',
        ];

        return [
            'type'       => 'logbook_status_changed',
            'message'    => $messages[$this->action] ?? 'Your logbook status has been updated.',
            'logbook_id' => $this->logbook->id,
            'task_title' => $this->logbook->task->title,
            'date'       => $this->logbook->date->toDateString(),
            'action'     => $this->action,
        ];
    }
}