## Обработка ошибок
В проекте используется мощный обработчик ошибок.
Каждая ошибка должна содержать свой код. Опционально можно добавить payload и cause.

Все возможные ошибки на каком-то роуте должны быть описаны в сваггере через `@ApiResponses`.

В проекте есть несколько вариантов ошибок.

### AppError
Наследован от `Error`. Стандартный тип ошибки для проекта. Отдаёт статус 400 в любой ситуации.
Используется для наследования собственных ошибок.

### Unknown Error
Неизвестный тип ошибки для непредвиденного поведения. Наследован от `AppError`, имеет код `UNKNOWN`.
Отдаёт статус 500 в любой ситуации. Также используется для явной обработки сторонних компонентов с помощью
`throwInternalError` и `withInternalError`.

### HttpError и HttpException
`HttpError` используется для обработки исключений `HttpException`, который предоставляет Nest.
`HttpError` наследован от `AppError`, имеет тип `HTTP`. Нужен лишь для приведения `HttpExceiption` в единый формат.
Не стоит использовать напрямую в проекте.

### ValidationError
Используется для обработки ошибок, выдаваемых схемами `zod`.
`ValidationError` наследован от `AppError`, имеет тип `Validation`. Отдаёт статус 400 в любой ситуации.
Как и в случае с `HttpError`, нужен лишь для приведения к общему виду и напрямую использоваться не должен.

Подробнее про обработку ошибок можно посмотреть в `error.filter.ts`.

### Собственные ошибки
Все ожидаемые ошибки должны быть наследованы от `AppError`. Для этого можно использовать функцию
`defineError`. Она принимает код ошибки и опционально zod-схему payload.

```ts
class UserNotFoundError extends defineError('USER_NOT_FOUND') {}

class UserLoginTakenError extends defineError('LOGIN_TAKEN', {
  login: z.string(),
}) {}
```
