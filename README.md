# AMR - GLASS App
Blessed repository for the GLASS application in WIDP

## Setup

Install dependencies:

```
$ yarn install
```

## Development

Start the development server:

```
$ PORT=8081 REACT_APP_DHIS2_BASE_URL="http://localhost:8080" yarn start
```

Now in your browser, go to `http://localhost:8081`.

Notes:

-   Requests to DHIS2 will be transparently proxied (see `src/setupProxy.js`) from `http://localhost:8081/dhis2/path` to `http://localhost:8080/path` to avoid CORS and cross-domain problems.

-   The optional environment variable `REACT_APP_DHIS2_AUTH=USERNAME:PASSWORD` forces some credentials to be used by the proxy. This variable is usually not set, so the app has the same user logged in at `REACT_APP_DHIS2_BASE_URL`.

-   The optional environment variable `REACT_APP_PROXY_LOG_LEVEL` can be helpful to debug the proxyfied requests (accepts: "warn" | "debug" | "info" | "error" | "silent")

-   Create a file `.env.local` (copy it from `.env`) to customize environment variables so you can simply run `yarn start`.

-   [why-did-you-render](https://github.com/welldone-software/why-did-you-render) is installed, but it does not work when using standard react scripts (`yarn start`). Instead, use `yarn start-profiling` to debug re-renders with WDYR. Note that hot reloading does not work out-of-the-box with [craco](https://github.com/gsoft-inc/craco).

## Tests

### Unit tests

```
$ yarn test
```

### Integration tests (Cypress)

Create the required users for testing (`cypress/support/App.ts`) in your instance and run:

```
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

## Build app ZIP

```
$ yarn build
```

## AMC data consumption recalculations

The app provides a server-side AMC recalculations script that runs in the background. The script requires Node v10+.

1. Build and generates glass-dev-amc-recalculate-server.zip file:

```
$ yarn build-amc-recalculate
```

2. Unzip glass-dev-amc-recalculate-server.zip and executed it like this:

```
$ cd glass-dev-amc-recalculate-server
$ node index.js --url "http[s]://HOST:PORT" --auth USERNAME:PASSWORD
```

To just run the script manually for development:

```
$ yarn start-amc-recalculate --url "http[s]://HOST:PORT" --auth USERNAME:PASSWORD
```

## AMR AGG data validation and reset scripts

Due to 'Import Ignore' errors, there could be data corruption AMR Aggregate module.

1. Run the following script, to detect if there are any errors. Ensure you have the URL and Auth credentails in your .env file and change the .env value based on your environment.

```
$ source .env && ts-node src/scripts/amr_agg_data_validation.ts --url $REACT_APP_DHIS2_BASE_URL --auth $REACT_APP_DHIS2_AUTH
```

2. Run the following script (with the period and org unit as parameters), to create a json with all valaues to be deleted. Import the json created using Import/Export app with "Delete" option selected.

```
$ source .env && ts-node src/scripts/amr_agg_data_reset.ts  --url $REACT_APP_DHIS2_BASE_URL --auth $REACT_APP_DHIS2_AUTH
```

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool.
-   `src/pages`: Main React components.
-   `src/domain`: Domain layer of the app (clean architecture)
-   `src/data`: Data of the app (clean architecture)
-   `src/components`: Reusable React components.
-   `src/types`: `.d.ts` file types for modules without TS definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, do not update or add to the version control.
-   `cypress/integration/`: Cypress integration tests.

### i18n

```
$ yarn localize
```

### App context

The file `src/contexts/app-context.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.
