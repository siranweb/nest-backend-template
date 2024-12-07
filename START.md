# {project_name}

{description}

## Requirements
* NodeJS >= v20.10.0
* Npm
* Docker with docker-compose

## Run application

### For development
1. Install dependencies
    ```shell
    npm install
    ```
2. Provide environment variables to `env/run` (you can copy content from `env/example`):
    * `env/run/app.env`
    * `env/run/app-database.env`
3. Start application services
    ```shell
    npm run compose:dev:up
    ```
4. Run migrations
   ```shell
   npm run migrations:sync
   ```
5. Start application itself
    ```shell
    npm run start
    # or
    npm run start:dev
    ```

### For production
1. Provide environment variables to `env/run` (if needed):
    * `env/run/app.env`
    * `env/run/app-database.env`
2. Start app with services
    ```shell
    npm run compose:up
    ```
3. Open shell in docker container and run migrations
   ```shell
   docker exec -it <container_id> bash
   cd app
   npm run migrations:sync
   ```
