(function (ko) {
    ko.composableCommand = function (options) {
        var defaults = {
            canExecute: true,
            execute: function () {},
        };

        options = options || {};
        options.execute = options.execute || defaults.execute;
        
        var modules = ko.observableArray([]);
        var hasModules = ko.computed(function() { return modules().length > 0 });
        var baseCanExecute = ko.computed(function() {
            return options.canExecute ? options.canExecute() : hasModules();
        });
        var modulesCanBeExecuted = ko.computed(function () {
            return ko.utils.arrayFirst(modules(), function (m) {
                return m.canExecute() !== true;
            }, self) == null;
        });
        
        var cmd = ko.asyncCommand({
            canExecute: function(isExecuting) {
                return !isExecuting && baseCanExecute() && modulesCanBeExecuted();
            },
            execute: function(completed) {
                options.execute(completed);
                completed();
            }
        });
        
        var baseExecute = cmd.execute;
        cmd.execute = function (arg1, arg2) {
            baseExecute.apply(cmd, [arg1, arg2]);
            executeModules(arg1, arg2);
        };
        cmd.addCommand = function (commandModule) {
            modules.push(commandModule);
        };
        cmd.clearModules = function () {
            modules([]);
        };

        return cmd;
        
        function executeModules(arg1, arg2) {
            ko.utils.arrayForEach(modules(), function (cmd) {
                cmd.execute(arg1, arg2);
            });
        }
    };
})(ko);
