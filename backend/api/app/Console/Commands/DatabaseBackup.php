<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    protected $signature = 'db:backup';

    protected $description = 'Create database backup';

    public function handle()
    {
        try {
            $dbName = env('DB_DATABASE', 'Corstat');
            $dbUser = env('DB_USERNAME', 'Corstat');
            $dbPassword = env('DB_PASSWORD', '');
            $dbHost = env('DB_HOST', 'postgres');
            $dbPort = env('DB_PORT', '5432');

            $backupDir = storage_path('app/backups');
            if (!is_dir($backupDir)) {
                if (!mkdir($backupDir, 0755, true) && !is_dir($backupDir)) {
                    throw new \RuntimeException("DatabaseBackup[handle] Failed to create backup directory: {$backupDir}");
                }
            }

            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $backupFileName = "backup_{$dbName}_{$timestamp}.sql";
            $backupPath = "{$backupDir}/{$backupFileName}";

            $pgDumpPath = $this->findPgDump();
            
            if ($pgDumpPath) {
                $env = ['PGPASSWORD' => $dbPassword];
                $envString = '';
                foreach ($env as $key => $value) {
                    $envString .= sprintf('%s=%s ', $key, escapeshellarg($value));
                }
                
                $command = sprintf(
                    '%s%s -h %s -p %s -U %s -d %s -F p -f %s 2>&1',
                    $envString,
                    escapeshellarg($pgDumpPath),
                    escapeshellarg($dbHost),
                    escapeshellarg($dbPort),
                    escapeshellarg($dbUser),
                    escapeshellarg($dbName),
                    escapeshellarg($backupPath)
                );
            } else {
                $containerName = env('POSTGRES_CONTAINER', 'diplom_postgres');
                $command = sprintf(
                    'docker exec -e PGPASSWORD=%s %s pg_dump -U %s -d %s -F p > %s 2>&1',
                    escapeshellarg($dbPassword),
                    escapeshellarg($containerName),
                    escapeshellarg($dbUser),
                    escapeshellarg($dbName),
                    escapeshellarg($backupPath)
                );
            }

            exec($command, $output, $returnCode);

            if ($returnCode !== 0 || !file_exists($backupPath) || filesize($backupPath) === 0) {
                $error = implode("\n", $output);
                if (file_exists($backupPath) && filesize($backupPath) === 0) {
                    unlink($backupPath);
                }
                Log::error('DatabaseBackup[handle]', [
                    'error' => $error,
                    'return_code' => $returnCode
                ]);
                $this->error("DatabaseBackup[handle] Backup failed: {$error}");
                return 1;
            }

            $fileSize = filesize($backupPath);
            $fileSizeMB = round($fileSize / 1024 / 1024, 2);

            Log::info('DatabaseBackup[handle]', [
                'backup_file' => $backupFileName,
                'file_size_mb' => $fileSizeMB,
                'path' => $backupPath
            ]);

            $this->info("DatabaseBackup[handle] Backup created successfully: {$backupFileName} ({$fileSizeMB} MB)");

            $this->cleanOldBackups($backupDir);

            return 0;
        } catch (\Exception $e) {
            Log::error('DatabaseBackup[handle]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->error("DatabaseBackup[handle] Error: {$e->getMessage()}");
            return 1;
        }
    }

    private function findPgDump(): ?string
    {
        $paths = ['pg_dump', '/usr/bin/pg_dump', '/usr/local/bin/pg_dump'];
        
        foreach ($paths as $path) {
            $result = shell_exec("which {$path} 2>/dev/null");
            if ($result && trim($result)) {
                return trim($result);
            }
        }
        
        return null;
    }

    private function cleanOldBackups(string $backupDir, int $keepDays = 7): void
    {
        try {
            $files = glob("{$backupDir}/backup_*.sql");
            $now = time();
            $deletedCount = 0;

            foreach ($files as $file) {
                if (is_file($file)) {
                    $fileTime = filemtime($file);
                    $daysOld = ($now - $fileTime) / (60 * 60 * 24);

                    if ($daysOld > $keepDays) {
                        unlink($file);
                        $deletedCount++;
                        Log::info('DatabaseBackup[cleanOldBackups]', [
                            'deleted_file' => basename($file),
                            'days_old' => round($daysOld, 1)
                        ]);
                    }
                }
            }

            if ($deletedCount > 0) {
                $this->info("DatabaseBackup[cleanOldBackups] Deleted {$deletedCount} old backup(s)");
            }
        } catch (\Exception $e) {
            Log::error('DatabaseBackup[cleanOldBackups]', [
                'error' => $e->getMessage()
            ]);
        }
    }
}

