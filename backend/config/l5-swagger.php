<?php

return [
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => [
                'title' => 'UTHANO API Documentation',
            ],

            'routes' => [
                'api' => 'api/documentation',
            ],

            'paths' => [
                'docs' => storage_path('api-docs/docs.json'),
                'docs_to_disk' => env('L5_SWAGGER_GENERATE_ALWAYS', false),
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),
                'annotations' => [
                    base_path('app'),
                ],
            ],
        ],
    ],
    'default' => 'default',
];