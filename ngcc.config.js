// https://github.com/DevExpress/devextreme-angular/issues/1047
// https://supportcenter.devexpress.com/ticket/details/t860229/devextreme-entry-point-contains-deep-imports-warnings-occur-during-angular-9-project
module.exports = {
    packages: {
        'devextreme-angular': {
            ignorableDeepImportMatchers: [
                /devextreme\//
            ]
        }
    }
};
