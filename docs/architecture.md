# llm-translator architecture

## Product shape

A pure front-end React + TypeScript application intended for desktop browsers and Android/HarmonyOS mobile browsers. It stores user data locally in the browser and sends requests directly to the configured LLM endpoint.

## Storage

Use localStorage with one top-level app state record:

- configs: saved LLM connection profiles
- activeConfigId: currently selected profile
- autoTranslateDelaySeconds: inactivity delay before auto-translate
- sourceText: current input text
- targetText: latest streamed output text
- promptTemplate: optional translation instruction template

## Config structure

Each profile contains:

- id
- name
- provider
- baseUrl
- apiKey
- model
- systemPrompt
- temperature
- enabled

Provider is mainly display metadata. Real request routing uses baseUrl + model + apiKey so OpenAI-compatible endpoints can work uniformly.

## Request model

Use fetch directly against an OpenAI-compatible chat completions endpoint.

Assume endpoint path:
- `${baseUrl}/chat/completions`

Payload:
- model
- messages: system + user
- stream: true for translate
- max_tokens optional omitted for now
- temperature from config

Speed test uses a non-streaming request with a short prompt like `Reply with hello.` and measures elapsed time.

## Stream handling

Read the response body as a stream.

Support two common formats:
1. OpenAI SSE chunks: lines prefixed with `data:` and ending with `[DONE]`
2. Plain JSON lines fallback

Extract delta text from:
- choices[0].delta.content
- if absent, fallback to choices[0].message.content

## Auto-translate guard against duplicate repeat requests

Maintain these refs/state values:
- lastRequestedText
- lastCompletedText
- pending debounce timer
- current AbortController
- request sequence id

Behavior:
- on input change, clear timer
- if text is empty, abort current request and clear output
- after delay, only request when trimmed text differs from lastRequestedText
- when a request starts, set lastRequestedText to current text snapshot
- if user edits during a request, abort old request and schedule a new one
- do not schedule repeated requests from inactivity alone, because unchanged text equals lastRequestedText

## UI layout

Single-page app with two main regions:

1. Top control area
- active config selector
- open/close settings panel button
- translate button
- auto translate delay input
- streaming/status badge

2. Translation workspace
- left textarea for source text
- right read-only textarea/panel for translated text

3. Settings drawer/panel
- saved config list
- switch active config
- add config
- edit config
- delete config
- speed test button per config

## Mobile support

Responsive stacked layout below tablet width:
- top controls wrap
- source and target panels stack vertically
- buttons use large hit targets

## Testing targets

Unit tests first for:
- localStorage serialization/deserialization
- duplicate auto-trigger prevention decision logic
- streaming chunk parser
- config CRUD helper behavior

Then component tests for:
- render saved config list
- switch config
- translate button disabled when no active config or no text
