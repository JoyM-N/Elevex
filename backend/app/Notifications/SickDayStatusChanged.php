<?php

namespace App\Notifications;

use App\Models\SickDay;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * SickDayStatusChanged Notification
 *
 * Sent to an intern when an admin approves or rejects
 * their sick day request.
 */
class SickDayStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly SickDay $sickDay,
        private readonly string  $action
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $messages = [
            'approved' => "Your sick day request for {$this->sickDay->date->toDateString()} has been approved.",
            'rejected' => "Your sick day request for {$this->sickDay->date->toDateString()} has been rejected.",
        ];

        return [
            'type'        => 'sick_day_status_changed',
            'message'     => $messages[$this->action] ?? 'Your sick day request status has been updated.',
            'sick_day_id' => $this->sickDay->id,
            'date'        => $this->sickDay->date->toDateString(),
            'action'      => $this->action,
        ];
    }
}