# Migrating a node

1. ALTUI -> More -> Table Controllers--> Exclude
1. Exclude the node
1. Integrations -> Vera -> Reload
1. Entities -> Sort by status -> Remove failed
1. Zwavejs2Mqtt -> Manage Nodes -> Include
1. Include the node
1. Integrations -> Zwavejs -> Entities -> find the new node
2. Update status.json to denote progress
3. Search & Replace in config if entity IDs change