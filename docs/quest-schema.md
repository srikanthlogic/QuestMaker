# QuestCraft JSON Schema

Every game in QuestCraft is defined by a single `quest.json` configuration file. This document details the structure and all available fields for creating your own quest.

## Root Object

The root of the JSON file is an object representing the `QuestConfig`.

| Key                     | Type                          | Required | Description                                                                                             |
| ----------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `name`                  | `string`                      | Yes      | The title of your quest. Appears on the game board and in headers.                                      |
| `description`           | `string`                      | Yes      | A short, one-sentence tagline describing the quest's theme.                                             |
| `positivity`            | `number`                      | No       | A value from 0.0 (very challenging/dystopian) to 1.0 (very optimistic/hopeful). Defaults to 0.5. Affects AI scenario generation tone. |
| `resources`             | `Array<ResourceDefinition>`   | Yes      | An array defining the core resources players manage.                                                    |
| `playerColors`          | `Array<string>`               | Yes      | An array of Tailwind CSS text color classes (e.g., `"text-red-600"`) for player tokens.                  |
| `board`                 | `Board`                       | Yes      | An object defining the game board's layout and spaces.                                                  |
| `chanceCards`           | `Array<ChanceCard>`           | Yes      | An array of "Chance" cards.                                                                             |
| `communityChestCards`   | `Array<ChanceCard>`           | No       | An optional array of "Community Chest" style cards.                                                     |
| `footerSections`        | `Array<FooterSection>`        | Yes      | Content for the informational modals in the game footer (e.g., rules, about).                           |
| `pregeneratedScenarios` | `ScenariosByLocation`         | No       | A collection of pre-written scenarios that can be used instead of AI-generated ones.                    |

---

## `ResourceDefinition` Object

Defines a single resource that players track.

| Key            | Type     | Required | Description                                                                   |
| -------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `name`         | `string` | Yes      | The display name of the resource (e.g., "Money", "Security").                 |
| `icon`         | `string` | Yes      | The name of the icon component. Must be one of: `MoneyIcon`, `TimeIcon`, `InfoIcon`. |
| `barColor`     | `string` | Yes      | A Tailwind CSS background color class for the resource bar (e.g., `"bg-green-500"`). |
| `initialValue` | `number` | Yes      | The starting value for this resource for all players.                         |

**Example:**
```json
"resources": [
    { "name": "Money", "icon": "MoneyIcon", "barColor": "bg-green-500", "initialValue": 100 },
    { "name": "Security", "icon": "InfoIcon", "barColor": "bg-purple-500", "initialValue": 50 }
]
```

---

## `Board` Object

Defines the structure of the game board.

| Key            | Type                  | Required | Description                                                                              |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `jailPosition` | `number`              | Yes      | The index of the "Jail" space in the `locations` array.                                  |
| `locations`    | `Array<BoardLocation>`| Yes      | An array of location objects that make up the board spaces. The order defines the path. Must be a multiple of 4 (e.g., 20, 24, 40). |

### `BoardLocation` Object

| Key           | Type                | Required | Description                                                                              |
| ------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `name`        | `string`            | Yes      | The name of the space.                                                                   |
| `description` | `string`            | Yes      | A short description used by the AI to generate relevant scenarios.                       |
| `type`        | `BoardLocationType` | Yes      | The type of space. See valid types below.                                                |
| `color`       | `string`            | No       | For `PROPERTY` spaces, a Tailwind CSS background color class for the color bar (e.g., `"bg-yellow-600"`). |

**`BoardLocationType` Enum:**
`"START"`, `"PROPERTY"`, `"CHANCE"`, `"COMMUNITY_CHEST"`, `"UTILITY"`, `"TAX"`, `"JAIL"`, `"FREE_PARKING"`, `"GO_TO_JAIL"`

**Example:**
```json
"board": {
    "jailPosition": 5,
    "locations": [
        { "name": "Start", "description": "Begin your journey.", "type": "START" },
        { "name": "Kirana Store QR", "description": "Pay for groceries.", "type": "PROPERTY", "color": "bg-yellow-600" },
        { "name": "Chance", "description": "Draw a chance card.", "type": "CHANCE" },
        { "name": "Account Frozen", "description": "Your account is frozen.", "type": "JAIL" }
    ]
}
```

---

## `ChanceCard` Object

Defines a "Chance" or "Community Chest" card.

| Key               | Type                  | Required | Description                                                                           |
| ----------------- | --------------------- | -------- | ------------------------------------------------------------------------------------- |
| `description`     | `string`              | Yes      | The text displayed on the card.                                                       |
| `resourceChanges` | `Record<string, number>` | Yes      | An object mapping **lowercase** resource names to the amount they should change by.   |

**Example:**
```json
"chanceCards": [
    {
        "description": "You receive cashback on a bill payment. Gain Money.",
        "resourceChanges": { "money": 20, "security": 0, "time": 0 }
    }
]
```

---

## `FooterSection` Object

Defines an informational section accessible from the game's footer.

| Key       | Type     | Required | Description                                                                    |
| --------- | -------- | -------- | ------------------------------------------------------------------------------ |
| `title`   | `string` | Yes      | The text for the button in the footer.                                         |
| `content` | `string` | Yes      | The content to display in the modal. Can contain simple HTML like `<ul>`, `<li>`, `<strong>`. |

**Example:**
```json
"footerSections": [
    {
        "title": "Rules of the Game",
        "content": "<ul><li><strong>Goal:</strong> Be the last player standing.</li></ul>"
    }
]
```

---

## `PregeneratedScenarios` (ScenariosByLocation)

This is an object where keys are the `name` of a `PROPERTY` or `UTILITY` `BoardLocation`, and values are an array of `ManagedScenario` objects for that location.

### `ManagedScenario` Object

| Key           | Type                | Required | Description                                                                                                   |
| ------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`            | Yes      | A unique identifier for the scenario within its location (e.g., `"bb-1"`).                                    |
| `title`       | `string`            | Yes      | The title of the scenario card.                                                                               |
| `description` | `string`            | Yes      | The main text of the scenario, presenting a problem to the player.                                            |
| `choices`     | `Array<Choice>`     | Yes      | An array containing **exactly two** `Choice` objects.                                                         |
| `sourceUrl`   | `string`            | No       | An optional URL to a real-world article or source that inspired the scenario.                                 |
| `sourceTitle` | `string`            | No       | The title of the source, displayed as the link text if a `sourceUrl` is provided.                             |
| `custom`      | `boolean`           | Yes      | Should always be `false` in a base quest file. This is used internally for scenarios added by the user.       |
| `enabled`     | `boolean`           | Yes      | Should always be `true` in a base quest file. This is used internally for user-toggled scenarios.             |

### `Choice` Object

| Key       | Type            | Required | Description                                    |
| --------- | --------------- | -------- | ---------------------------------------------- |
| `text`    | `string`        | Yes      | The text for the choice button.                |
| `outcome` | `ChoiceOutcome` | Yes      | An object describing the result of the choice. |

### `ChoiceOutcome` Object

| Key               | Type                  | Required | Description                                                                         |
| ----------------- | --------------------- | -------- | ----------------------------------------------------------------------------------- |
| `explanation`     | `string`              | Yes      | The text explaining the outcome after a choice is made.                             |
| `resourceChanges` | `Record<string, number>` | Yes      | An object mapping **lowercase** resource names to the amount they should change by. |

**Example:**
```json
"pregeneratedScenarios": {
    "Kirana Store QR": [
        {
            "id": "ks-1",
            "title": "Payment Failure",
            "description": "You scan the QR code to pay, but the transaction fails due to a network error.",
            "choices": [
                {
                    "text": "Try again in a few minutes.",
                    "outcome": {
                        "explanation": "You wait and the second attempt works, but you've lost valuable time.",
                        "resourceChanges": { "money": 0, "security": 0, "time": -10 }
                    }
                },
                {
                    "text": "Pay with cash instead.",
                    "outcome": {
                        "explanation": "You use cash to complete the purchase quickly, but miss out on potential digital rewards.",
                        "resourceChanges": { "money": -5, "security": 0, "time": 0 }
                    }
                }
            ],
            "custom": false,
            "enabled": true
        }
    ]
}
```