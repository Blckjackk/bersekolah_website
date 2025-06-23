# API Configuration Guide

## Overview

This application connects to the Bersekolah REST API. Previously, configuration was done via environment variables in `.env.local`, but we've simplified the approach to use either:

1. A locally stored configuration in your browser
2. A default value that can be overridden during development

## Default Configuration

By default, the API connects to:

```
http://localhost:8000/api
```

## Changing the API URL

You have two ways to change the API URL:

### 1. Using the Configuration UI

The application provides a built-in configuration page:

1. Navigate to `/api-config` in your browser
2. Enter the new API URL
3. Click "Save Configuration"

The setting will be stored in your browser's localStorage and persist across sessions.

### 2. Using the Debug Page

For more advanced configuration and testing:

1. Navigate to `/debug/api-test`
2. You can configure the URL and test connectivity directly from this page

## During Development

If you're developing the application and need to change the default URL for all users, edit:

```
src/lib/config/api-config.ts
```

And change the `baseURL` value.

## Resetting to Default

You can reset to the default API URL either:

1. Via the config pages mentioned above
2. By clearing localStorage in your browser's developer tools
