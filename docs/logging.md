# Логирование
Для логирования используется класс `Logger`, работающий на `pino`.
Для логгера доступно несколько методов. Каждый принимает как минимум строку и метаданные:
* `trace` - используется для отслеживания вызовов функций
* `debug` - используется для объяснения ПОЧЕМУ произошло действие
* `info` - используется, чтобы показать ЧТО произошло
* `warn` - используется, чтобы указать на неожидаемое поведение или проблему (но не приводящей к ошибке)
* `error` - используется, чтобы указать на ошибку. Может принимать `Error`
* `fatal` используется, чтобы указать на критическую ошибку, которая
  влияет на работоспособность подсистемы или приложение целиком. Может принимать `Error`

При использовании логгера нужно явно задавать контекст:

```ts
class SomeCase {
  constructor(logger: ILogger) {
    this.logger.setContext(SomeClass.name);
  }
}
```

Под капотом логгер использует `AsyncStorage`. Он подмешивает в метаданные `requestId` -
уникальное значение текущего запроса. По нему можно отследить всю цепочку вызовов методов.

Логи должны быть написаны на английском языке и в следующем формате:
```ts
this.logger.info('Starting creating user.', { data });
```
В метаданные может передаваться информация, которая дополняет сам лог.
Метаданные не должны содержать динамических полей:
```ts
// Неверное использование
// someField - динамический
this.logger.info('Starting creating user.', { [someField]: someValue });
```

Каждый юзкейс должен иметь входной и выходной лог (в случае успеха):
```ts
class CreateUserCase implements ICreateUserCase {
  constructor(logger: ILogger) {
    this.logger.setContext(SomeClass.name);
  }
  
  async execute(params: TCreateUserParams): Promise<User> {
    this.logger.info('Starting creating user.', { params });
    // ...создание пользователя...
    this.logger.info('Successfully created user.', { user });
  }
}
```

Все логи преобразуются в JSON. Если NODE_ENV задан как `development`, то используется `prettyPrint`.
