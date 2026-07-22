# language bar redesign

## New state

Add `sourceLanguage` to app storage.
Default: `auto`.
Persist together with targetLanguage.

## Prompt rules

Translate request should build user instruction as:

- sourceLanguage === `auto`
  - `Detect the source language and translate the following text into <target>. Return only the translation unless the user explicitly asks otherwise.`
- otherwise
  - `Translate the following text from <source> into <target>. Return only the translation unless the user explicitly asks otherwise.`

This keeps the mechanism provider-agnostic and deterministic.

## Swap behavior

When clicking swap:
- if sourceLanguage is `auto`, do not swap the language codes directly into target because `auto` is not a concrete language
- instead:
  - set sourceLanguage to previous targetLanguage
  - keep targetLanguage unchanged if no reliable concrete source exists? no, that would not be a real swap

Better rule:
- only perform full language swap when sourceLanguage !== `auto`
- when sourceLanguage === `auto`
  - set sourceLanguage to targetLanguage
  - set targetLanguage to `zh-CN` default? this is surprising and wrong

So use a better UX rule:
- disable swap when sourceLanguage === `auto` and show tooltip-like title
- full swap requires explicit source language

Text swap on valid swap:
- sourceText <-> targetText
- abort in-flight request
- reset lastRequestedText to avoid stale duplicate logic

## UI layout

Create a dedicated language bar above the text panels:

- [源语言 select] [swap button] [目标语言 select]
- source language includes `自动检测` plus the existing language list
- target language uses the same language list but excludes `auto`

Toolbar below it keeps:
- current config
- auto delay
- config management
- translate button
- status chip still in header

## Tests to add first

- storage default includes sourceLanguage auto and targetLanguage zh-CN
- app renders source language selector with auto selected
- app renders swap button
- swap button disabled when sourceLanguage is auto
