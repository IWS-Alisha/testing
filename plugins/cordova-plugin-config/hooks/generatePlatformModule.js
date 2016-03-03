#!/usr/bin/env node

module.exports = function(context)
{
    console.log('CordovaConfig plugin hooked on ' + context.hook);

    var fs = context.requireCordovaModule('fs');
	var path = context.requireCordovaModule('path');
	var q = context.requireCordovaModule('q');
	var writeFile = q.denodeify(fs.writeFile);
	var semver = context.requireCordovaModule('semver');

	var ConfigParser = context.requireCordovaModule('cordova-lib').configparser;
	var cfg = new ConfigParser(path.join(context.opts.projectRoot, 'config.xml'));
	var version = cfg.version();
	var appName = cfg.name();

    //console.log('CordovaConfig plugin hook about to check Cordova version');

    // Enforce the min version supported.
	if(semver.lt(context.opts.cordova.version, '5.0.0'))
	{
	    var errMsg = 'CordovaConfig plugin supports Cordova versions >= 5.0.0 (current ' + context.opts.cordova.version + ')';
	    console.log('Error: ' + errMsg);
	    throw new Error(errMsg);
	}

    function folderExists(path)
    {
        try
        {
            var stats = fs.statSync(path);
            if (!stats.isDirectory())
                throw new Error('CordovaConfig plugin hook exception: path is not a folder: ' + path);
            return true;
        }
        catch (e)
        {
            if (e.code == 'ENOENT')  // no such file or directory. Normal case.
                return false;

            console.log("CordovaConfig plugin hook exception accesing path: " + path + ": " + e.message);
            throw e; // something else went wrong, we don't have rights, ...
        }
    }

    function writeWrapper(platformName)
    {
        //console.log('CordovaConfig plugin hook method called: writeWrapper(' + platformName + ')');

	    var folderPath = path.join(
            context.opts.projectRoot,
            'platforms',
            platformName);
	    if (platformName == "android") folderPath = path.join(folderPath, 'assets');
	    folderPath = path.join(folderPath,
            platformName == "windows" ? 'www' : 'www',  // was platform_www on Windows. May be needed in both locations.
            'plugins',
            context.opts.plugin.id,
            'www');
	    if (!folderExists(folderPath))
	    {
	        console.log("CordovaConfig plugin hook procrastinating until appears path: " + folderPath);
	        return null;
	    }
	    var filePath = path.join(folderPath, 'module.js');
	    var result = writeFile(filePath,
            'cordova.define("cordova-plugin-config.module", '
            + 'function(require, exports, module) {'
            + ' module.exports.getAppVersion = function() { return "' + version + '"; };'
            + ' module.exports.getAppName = function() { return "' + appName + '"; }; '
            + '});'
		);
	    console.log("CordovaConfig plugin hook wrote out file: " + filePath);
	    return result;
	}
	
    function createWriteCallbacks(platforms)
    {
        //console.log('CordovaConfig plugin hook method called: createWriteCallbacks(' + platforms + ')');

	    if (!platforms)  // Nothing to do.
	        return [];

		return platforms.map(function(platformName) {

			return writeWrapper(platformName);
		});
	}

    //console.log('CordovaConfig plugin hook set to work');

	var result = q.all(createWriteCallbacks(context.opts.platforms));

    //console.log('CordovaConfig plugin hook complete');

	return result;
};