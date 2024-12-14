# Авторизация
Из коробки доступна авторизация на JWT-токенах. Она использует `accessToken` и `refreshToken`.
Токены передаются либо через httpOnly куки, либо через заголовок `Authorization: Bearer <accessToken>`.
По API доступна только передача через куки. Авторизация через заголовок доступна в сваггере.

Для защиты API роута и описания сваггера используется декоратор `@Auth`. Для получения payload'а токена
используется декоратор для параметров `@TokenPayload`:
```ts
// Для упрощения, в примере специальн убран лишний функционал
@Controller('/example')
class Controller {
  @Post()
  @Auth()
  public async someAction(
    @TokenPayload() payload: TAccessTokenPayload
  ): Promise<void> {
    await this.someCase.execute(payload.userId);
  }
}
```
`@TokenPayload` может быть использован только в связке с `@Auth`, т.к. сам он не валидирует токен,
а только парсит payload.

Бывают случаи, когда авторизация может быть опциональной. Для этого можно выбрать тип авторизации `soft`.
С типом `soft` декоратор не выбрасывает ошибку если токен отсутствует. Однако, если токен некорректный, ошибка всё равно упадёт.

В этом случае нужно также обновить тип переменной `@TokenPayload`:
```ts
@Controller('/example')
class Controller {
  @Post()
  @Auth('soft') // <-----
  public async someAction(
    @TokenPayload() payload: TAccessTokenPayload | null // <-----
  ): Promise<void> {
    await this.someCase.execute(payload.userId);
  }
}
```
