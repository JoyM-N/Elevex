<?php

namespace App\Services;

use App\Models\FileUpload;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * FileUploadService
 *
 * Handles all file upload operations in Elevex.
 *
 * Security practices enforced here:
 *   - Files are renamed to UUIDs on upload
 *     prevents filename conflicts and enumeration attacks
 *   - Original filename stored separately for display only
 *   - Disk is configurable per environment
 *     'public' locally, 's3' in production via .env
 *
 * Polymorphic uploads:
 *   Files can be attached to any model that has the
 *   MorphMany 'fileUploads' relationship.
 *   e.g. Logbook, User (avatar)
 */
class FileUploadService
{
    /**
     * Store a file and create a FileUpload record.
     *
     * @param UploadedFile $file     The uploaded file
     * @param User         $user     Who is uploading
     * @param object       $model    The model to attach to (Logbook, User etc.)
     * @param string       $folder   Subfolder in storage e.g. 'logbooks', 'avatars'
     */
    public function store(
        UploadedFile $file,
        User $user,
        object $model,
        string $folder = 'uploads'
    ): FileUpload {
        $disk = config('filesystems.default', 'public');

        // Generate UUID filename — prevents conflicts and enumeration
        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store file on disk
        $path = $file->storeAs($folder, $storedName, $disk);

        // Create database record with metadata only — never file contents
        return FileUpload::create([
            'user_id'       => $user->id,
            'uploadable_id'   => $model->id,
            'uploadable_type' => get_class($model),
            'original_name' => $file->getClientOriginalName(),
            'stored_name'   => $storedName,
            'path'          => $path,
            'mime_type'     => $file->getMimeType(),
            'size'          => $file->getSize(),
            'disk'          => $disk,
        ]);
    }

    /**
     * Delete a file from disk and remove its database record.
     */
    public function delete(FileUpload $fileUpload): void
    {
        // Remove from disk first
        Storage::disk($fileUpload->disk)->delete($fileUpload->path);

        // Then remove the database record
        $fileUpload->delete();
    }

    /**
     * Store multiple files at once.
     * Returns collection of created FileUpload records.
     */
    public function storeMany(
        array $files,
        User $user,
        object $model,
        string $folder = 'uploads'
    ): array {
        return array_map(
            fn(UploadedFile $file) => $this->store($file, $user, $model, $folder),
            $files
        );
    }
}