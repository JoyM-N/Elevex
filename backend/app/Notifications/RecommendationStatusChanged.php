<?php

namespace App\Notifications;

use App\Models\RecommendationLetter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * RecommendationStatusChanged Notification
 *
 * Sent to an intern when an admin approves or rejects
 * their recommendation letter request.
 */
class RecommendationStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly RecommendationLetter $letter,
        private readonly string               $action
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $messages = [
            'approved' => 'Your recommendation letter has been approved and is ready to download.',
            'rejected' => 'Your recommendation letter request has been rejected.',
        ];

        return [
            'type'      => 'recommendation_status_changed',
            'message'   => $messages[$this->action] ?? 'Your recommendation letter status has been updated.',
            'letter_id' => $this->letter->id,
            'action'    => $this->action,
        ];
    }
}