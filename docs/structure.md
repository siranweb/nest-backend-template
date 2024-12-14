# Структура проекта и ключевые понятия

## Структура проекта
В корне проекта:
* `docs` - документация по проекту
* `env` - .env файлы
    * `env/example` - .env файлы для примера
    * `env/run` - .env файлы для работы проекта
* `migrations` - миграции для БД
* `scripts` - самописные скрипты
* `src` - само приложение
* ... и ряд служебных файлов

В `src`:
* `app.module.ts` - главный модуль приложения
* `main.ts` - входной файл
* `bootstrap` - штуки для запуска проекта
* `core` - модули корневой логики приложения
* `api` - модули контроллеров
* `infra` - инфраструктурные модули, для работы приложения
* `lib` - самописные дополнения к проекту
* `shared` - всякая переиспользуемая всячина

Все модули в `core` и `infra` строятся по принципу:
* `[name].module.ts` - определение модуля
* `[name].providers.ts` - провайдеры для модуля. Содержат приватные и публичные (экспортируемые) провайдеры
* `[name].di-constants.ts` - DI ключи для внедрения и описания провайдеров.
  Отделен от `[name].providers.ts` из-за цикличных зависимостей

## Ключевые понятия
### Сущности
Сущности - центральная часть приложения. Помимо своих свойств имеют методы для работы с ними.
Не стоит путать с сущностями, которые пришли из ORM (TypeORM, Sequelize, etc.). Таблицы БД и сущности приложения - две разные вещи.

При работе с сущностями в юзкейсе или сервисе не нужно их явно возвращать. Сущности существуют только в рамках модулей.
Для использования данных сущности в другом модуле нужно использовать простой объект, например:

```ts
class GetUserCase implements IGetUserCase {
  async execute(): TUserPlain {
    const user = new User({ ... });
    return user.toPlain();
  }
}
```

Сущности всегда должны содержать уникальный `id` в формате `uuidv7`.
В конструкторе сущности айди должен быть опционален, и быть сгенерирован внутри неё.
Обратите внимание, айди не генерируется на стороне БД.

```ts
import { uuidv7 } from 'uuidv7';

class SomeEntity {
  id: string;
  name: string;

  constructor(params: TSomeEntityParams) {
    this.id = params.id ?? uuidv7();
    this.name = name;
  }
}

type TSomeEntityParams = {
  id?: string;
  name: string;
}
```
Рекомендуется добавлять метод `toPlain()` для возврата простого объекта:
```ts
import { uuidv7 } from 'uuidv7';

class SomeEntity {
  public id: string;
  public name: string;

  constructor(params: TSomeEntityParams) {
    this.id = params.id ?? uuidv7();
    this.name = name;
  }

  public toPlain(): TSomeEntityPlain {
    return {
      id: this.id,
      name: this.name,
    }
  }
}

type TSomeEntityParams = {
  id?: string;
  name: string;
}

type TSomeEntityPlain = {
  id: string;
  name: string;
}
```

### Репозитории
Репозитории - способ обращения к БД. В репозиториях прописываются методы для конкретных операций.
Их стоит воспринимать как доступ к некому хранилищу, а не первичному источнику данных. Например:
```ts
interface IBooksRepository {
  getBooks(): Promise<Book[]>;
  createBook(book: Book): Promise<void>;
  getBookWithReviews(bookId: string): Promise<{ book: Book, reviews: Review[] } | null>;
  countBooks(): Promise<number>;
}

class CreateBookCase implements ICreateBookCase {
  // ...конструктор...
  
  public async execute(data: TCreateBookData): Promise<Book> {
    const book = new Book(data);
    await this.booksRepository.createBook(book);
    return book;
  }
}
```
Обратите внимание:
1. Репозитории в проекте должны быть **доменными**, т.е. мы должны проектировать репозиторий
   под модуль, а не под конкретную сущность. Например, в модуле `books` у нас есть сущности `Book` и `Review`,
   а потому мы можем свободно использовать обе сущности в одном репозитории.
   В противном случае пришлось бы создавать 2 репозитория `IBooksRepository` и `IReviewsRepository`, что накладывает
   некоторые ограничения (например, на метод `getBookWithReviews`);
2. Репозиторий исполняет две роли - доступ к БД и маппинг сущностей (то, что за нас делают ORM).
   Поэтому репозиторий должен принимать и отдавать данные в сущностях, где это возможно.

Не для всех данных/таблиц нужно создавать сущность. Иногда достаточно просто вернуть строку или объект,
если данные не нуждаются в сущности.

### Юзкейсы и сервисы
В юзкейсах и сервисах содержится бизнес-логика приложения. Их стоит использовать в разных ситуациях.

Юзкейсы должны описывать основные сценарии использования приложения:
* Создание пользователя
* Получение списка книг
* Создание заказа в сторонней системе

Каждый юзкейс должен иметь метод `async execute(): Promise<void> {}`,
с типизацией входных параметров и результата выполнения.

Сервисы же в свою очередь нужно рассматривать как что-то вспомогательное:
* Криптографический сервис (генерация хеша)
* Сервис токенов (валидация токенов, подпись токенов)
* Сервис пользователей с дублирующимся функционалом (хеширование пароля)

### Контроллеры
Все контроллеры должны располагаться в `api`.
Контроллеры необходимо описывать как можно полнее для генерации подробного сваггера.

Body, params, query и response должны быть использованы с `DTO`. Для удобства используется функция `createZodDto`,
которая использует схему `zod` для генерации. Это даёт несколько преимуществ:
* Более удобная форма описания содержимого запросов и ответов
* Встроенная валидация
* `zod` расширен библиотекой `zod-openapi`. Это позволяет описывать OpenAPI для сваггера прямо на месте.

Обязательно должны быть описаны поля `description` и `example`.

```ts
const createUserSchema = z.object({
  login: z.string().min(5).openapi({ description: 'Логин пользователя', example: 'sirandev' }),
  password: z.string().min(8).openapi({ description: 'Пароль пользователя', example: 'qwerty12345' }),
});
 
class CreateUserDto extends createZodDto(createUserSchema) {}

const userProfileSchema = z.object({
  id: z.string().openapi({ description: 'Айди пользователя', example: UUID_EXAMPLE }),
  login: z.string().openapi({ description: 'Логин', example: 'sirandev' }),
});

// Для ответов дополнительно передаём значение 'response'.
// Оно используется для перехвата ValidationError и приведения к UnknownError
class UserProfileResponse extends createZodDto(userProfileSchema, 'response') {}
```
Обратите внимание: входные `DTO` накладывают ограничения на поля, типа минимального кол-ва символов.
Для `Response` этого делать не нужно.

Примеры использования доступны в любом контроллере.

По-умолчанию, Nest не даёт возможности описывать несколько боди на один код ответа.
Для этого есть кастомный декоратор `@ApiResponses`, который принимает массив моделей (DTO и ошибки).
Рекомендуется использовать только его для описания ответов:

```ts
@Controller('/example')
class Controller {
  @Get()
  @ApiOperation({ summary: 'Пример' })
  @HttpCode(HttpStatus.OK)
  @ApiResponses(HttpStatus.OK, [ExampleResponse], { description: 'Пример ответа' })
  @ApiResponses(HttpStatus.BAD_REQUEST, [ExampleError, ExampleError2])
  public async getAuthUserProfile() {}
}
```

Для защищённых авторизацией путей стоит использовать декоратор `@Auth`.

Каждый контроллер должен использовать декоратор `@SharedResponses`,
который определяет стандартные для всех контроллеров ответы.

Контроллеры также передают в ответ заголовок `x-request-id`, используемый для логирования.
