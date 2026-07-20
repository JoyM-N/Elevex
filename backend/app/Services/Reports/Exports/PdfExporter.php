<?php

namespace App\Services\Reports\Exports;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * PdfExporter
 *
 * Handles generating PDF files from HTML views and
 * storing them on disk.
 *
 * Used by:
 *   ReportService           — monthly and weekly reports
 *   RecommendationService   — recommendation letters
 *
 * All PDFs are stored in storage/app/public/pdfs/
 * and served via the public disk.
 *
 * Returns the storage path so the calling service
 * can save it to the database record.
 */
class PdfExporter
{
    /**
     * Generate a PDF from a Blade view and store it on disk.
     *
     * @param string $view   Blade view name e.g. 'pdfs.report'
     * @param array  $data   Data passed to the view
     * @param string $folder Subfolder in storage e.g. 'reports', 'letters'
     *
     * @return string The storage path of the generated PDF
     */
    public function generate(string $view, array $data, string $folder = 'pdfs'): string
    {
        // Generate PDF from Blade view
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('a4', 'portrait');

        // Generate unique filename
        $filename = Str::uuid() . '.pdf';
        $path     = "{$folder}/{$filename}";

        // Store on public disk
        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Delete a stored PDF file.
     * Called when a record is deleted or regenerated.
     */
    public function delete(string $path): void
    {
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}