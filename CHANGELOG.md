# CHANGELOG

## v0.1.1

### Feature Optimizations

- Adjusted default temperature and embedding provider settings
- Added translation for chat deletion confirmation prompt (ce164e9)
- Updated default language to Chinese (b5680b9)
- Added Ollama API key support (56dde89)
- Added environment variables for application name and configuration (c476093, 3a37027)
- Added login and registration button components (dbf7f1b)

### API Optimizations

- Changed DeepSeek API runtime environment from "edge" to "nodejs" (5e46edd)
- Optimized DeepSeek API request handling (17235c6)
- Optimized DeepSeek API streaming data processing, added empty data packet every 5 seconds to prevent timeout (c48363c)
- Optimized DeepSeek API response handling, ensuring streaming data is sent once per second to prevent timeout (cc90245)
- Added extra headers in POST requests to support connection and content type for DeepSeek API (821b45a)
- Adjusted maximum token count from 8192 to 2048 to optimize API request performance (a4c85d8)

### Interface Improvements

- Optimized text format in sidebar data list (e83bf2e)
- Optimized help page layout, adjusted styles to improve user experience (3747123)
- Refactored chat page, updated route paths (6638dcd)
- Optimized quick settings option components (edc29a9)
- Refactored chat and settings pages, fixed state management for DeepSeek API key (268aaab)

### Brand Updates

- Updated application name to ChatbotUI (40f8784)
- Changed application name and related metadata to Hikafeng (94a7ad5)
- Updated license information, added Hikafeng as copyright holder (4daf629)
- Added user icon link in chat help component, pointing to Hikafeng website (822c404)

### Other Improvements

- Removed debug log output, cleaned up code (90f58d9)
- Updated package-lock.json version (36cadfa)
- Moved environment variable retrieval logic inside POST function (8a5cc4b)
- Added base metadata URL, optimized translation text (08da509)
- Updated project version number to 0.1.0 (1c13d30)

## v0.1.0

### RELEASE

- Released first version
