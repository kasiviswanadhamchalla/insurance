# Common Library Module

Shared library dependency packaged as a standard JAR file. It is imported by other backend microservice modules to share boilerplate utilities.

## Shared Packages
* `com.hackathon.common.dto`: Shared response models (`ApiResponse`, `ErrorResponse`).
* `com.hackathon.common.exception`: Base exception handlers and Rest Advice classes mapping validations and Denials to JSON payloads.
* `com.hackathon.common.filter`: OncePerRequest filter logging request latency.
* `com.hackathon.common.util`: Cryptographic JWT signing, validation, and claim parsing utilities.
