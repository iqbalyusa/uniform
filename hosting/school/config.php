<?php
declare(strict_types=1);
// This is a server-side gateway to the existing inventory Worker, not a database copy.
return [
    'upstream' => 'https://uniform.pribadisch.workers.dev',
    'origin' => getenv('SERAGAM_ORIGIN') ?: 'https://pribadidepok.sch.id',
];
