# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-09-26

### Added

- Initial Release

## Features
- Request validation on the frontend, API Gateway JSON schema validation, AWS Lambda request validation.
- API Gateway enabled with usage plan and custom authorizer validating the x-origin-verify header.
- CloudFront custom rulesets including geoblocking and UriPath validation and custom header propagation to the backend API Gateway origin.
- WAF Captcha and Captcha challenge actions based on the UriPath.
- Unit tests for the AWS Lambda including usage of the mock framework.