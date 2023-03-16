export enum CustomMigrationTargetView {
    createSubmitButton = "button[id='identity-form-submit']:contains('Create')",
    editSubmitButton = "button[id='identity-form-submit']:contains('Save')",
    actionsButton = "button[aria-label=Actions]",
    nameInput = "input[name='name']:not(:hidden)",
    descriptionInput = "input[name='description']:not(:hidden)",
    imageInput = "div[name='imageID']:not(:hidden) > input[type='file']",
    ruleInput = "div[name='customRulesFiles']:not(:hidden) > input[accept='.windup.xml']",
    takeMeThereNotification = "Take me there",
}
