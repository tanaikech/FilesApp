/**
 * GitHub  https://github.com/tanaikech/FilesApp<br>
 * getFilesAndFoldersInFolder method for FilesApp.<br>
 * - Retrieve files and folders just under a folder with folderId.
 * @param {String} folderId folderId.
 * @param {Object} mimeType One dimensional Array including mimeType you want to retrieve.
 * @param {String} fields fields which can be used at drive.files.list.
 * @return {Object} Return Object
 */
function getFilesAndFoldersInFolder(folderId, mimeType, fields) {
  var fa = new FilesApp();
  return fa.getFilesAndFoldersInFolder(folderId, mimeType, fields);
}

/**
 * getAllFoldersInFolder method for FilesApp.<br>
 * - Retrieve all folders of all level under folderId.
 * @param {string} folderId folderId
 * @return {Object} Return Object
 */
function getAllFoldersInFolder(folderId) {
  var fa = new FilesApp();
  return fa.getAllFoldersInFolder(folderId);
}

/**
 * getAllInFolder method for FilesApp.<br>
 * - Retrieve all files and folders of all level under folderId. All files and folders are included in an array without the level.
 * @param {string} folderId folderId
 * @param {Object} mimeType One dimensional Array including mimeType you want to retrieve.
 * @param {String} fields fields which can be used at drive.files.list.
 * @return {Object} Return Object
 */
function getAllInFolder(folderId, mimeType, fields) {
  var fa = new FilesApp();
  return fa.getAllInFolder(folderId, mimeType, fields);
}

/**
 * createTree method for FilesApp.<br>
 * - Create a file and folder tree. Retrieve all folders of all level under folderId. All files and folders are included in an array with the level.
 * @param {string} folderId Retrieve all folders of all level under folderId.
 * @param {Object} mimeType One dimensional Array including mimeType you want to retrieve.
 * @param {String} fields fields which can be used at drive.files.list.
 * @return {Object} Return Object
 */
function createTree(folderId, mimeType, fields) {
  var fa = new FilesApp();
  return fa.createTree(folderId, mimeType, fields);
}

// DriveApp.createFile(); // This is used for automatically enabling Drive API and detecting the scope for using Drive API by the script editor.
;

(function(r) {
  var FilesApp;
  FilesApp = (function() {
    var checkFields, createBatchRequests, createQ, createRequests, getAllFoldersInFolderMain, getDriveId, getFilesByAPIByFetchAll, getFilesByAPIByFetchAllforNoBatch, getFilesByAPIInit, getFilesInFolder, getQueryFromMimeTypes, getRoot, idToName, objToQueryParams, parseFilesByFolderList, parseResFromBatchRequests, singleReq;

    class FilesApp {
      constructor(o_) {
        this.url = "https://www.googleapis.com/drive/v3/files";
        this.fields = "";
        this.pageSize = 1000;
        this.headers = {
          Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
        };
        this.maxSearchFolders = 20;
        this.maxBatchRequests = 100;
        this.additionalQuery = "includeItemsFromAllDrives=true&supportsAllDrives=true";
        this.sharedDriveId = "";
      }

      // ----- begin main methods
      getFilesAndFoldersInFolder(parent, mimeTypeList, fields) {
        var mtlq, query;
        if (!parent || parent === "") {
          throw new Error("Folder ID was not found.");
        }
        mtlq = getQueryFromMimeTypes.call(this, mimeTypeList);
        parent = parent === "root" ? getRoot.call(this) : parent;
        query = {
          maxResults: this.pageSize,
          q: mtlq !== "" ? "'" + parent + "' in parents" + " and " + mtlq + " and trashed=false" : "'" + parent + "' in parents and trashed=false",
          fields: fields
        };
        this.sharedDriveId = getDriveId.call(this, parent);
        if (this.sharedDriveId) {
          query.corpora = "drive";
          query.driveId = this.sharedDriveId;
          this.additionalQuery += "&corpora=drive&driveId=" + this.sharedDriveId;
        }
        return singleReq.call(this, query);
      }

      getAllFoldersInFolder(parent) {
        var allFolders, query;
        if (!parent || parent === "") {
          throw new Error("Folder ID was not found.");
        }
        parent = parent === "root" ? getRoot.call(this) : parent;
        query = {
          pageSize: this.pageSize,
          q: "mimeType='application/vnd.google-apps.folder'",
          fields: "files(id,name,parents),nextPageToken"
        };
        this.sharedDriveId = getDriveId.call(this, parent);
        if (this.sharedDriveId) {
          query.corpora = "drive";
          query.driveId = this.sharedDriveId;
          this.additionalQuery += "&corpora=drive&driveId=" + this.sharedDriveId;
        }
        allFolders = singleReq.call(this, query);
        return getAllFoldersInFolderMain.call(this, parent, idToName.call(this, parent, "name"), allFolders);
      }

      getAllInFolder(parent, mimeTypes, fields) {
        var folderList;
        this.fields = fields;
        folderList = this.getAllFoldersInFolder(parent);
        return getFilesInFolder.call(this, folderList.id, mimeTypes);
      }

      createTree(parent, mimeTypes, fields) {
        var allFiles, folderList;
        folderList = this.getAllFoldersInFolder(parent);
        this.fields = checkFields.call(this, fields);
        allFiles = getFilesInFolder.call(this, folderList.id, mimeTypes);
        return parseFilesByFolderList.call(this, allFiles, folderList);
      }

    };

    FilesApp.name = "FilesApp";

    // ----- end main methods

    // ----- Tool
    getAllFoldersInFolderMain = function(folderId, folderName, folderList) {
      return (function() {
        var c;
        return (c = function(folder, folderName, folderSt, res) {
          var ar, arrayFolderSt;
          ar = folderList.filter(function(e) {
            return e.parents && e.parents[0] === folder;
          });
          folderSt += folderName + "#_foohoge_#" + folder + "#_aabbccddee_#";
          arrayFolderSt = folderSt.split("#_aabbccddee_#");
          arrayFolderSt.pop();
          res.name.push(arrayFolderSt.map(function(e) {
            return e.split("#_foohoge_#")[0];
          }));
          res.id.push(arrayFolderSt.map(function(e) {
            return e.split("#_foohoge_#")[1];
          }));
          ar.length === 0 && (folderSt = "");
          ar.forEach(function(e) {
            c(e.id, e.name, folderSt, res);
          });
          return res;
        })(folderId, folderName, "", {
          id: [],
          name: []
        });
      })();
    };

    getFilesInFolder = function(folderList, mimeTypeList) {
      var fl, folLen, i, k, mtlq, offset, qs, ref, rq, sep, urls;
      if (folderList.length === 0) {
        throw new Error("No folderList.");
      }
      fl = folderList.map(function(e) {
        return e[e.length - 1];
      });
      mtlq = getQueryFromMimeTypes.call(this, mimeTypeList);
      qs = [];
      folLen = fl.length;
      if (folLen > this.maxSearchFolders) {
        sep = Math.floor(folLen / this.maxSearchFolders);
        sep = folLen % this.maxSearchFolders > 0 ? sep + 1 : sep;
        for (i = k = 0, ref = sep; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
          offset = i * this.maxSearchFolders;
          qs.push(createQ.call(this, fl.slice(offset, offset + this.maxSearchFolders), mtlq));
        }
      } else {
        qs.push(createQ.call(this, fl, mtlq));
      }
      urls = getFilesByAPIInit.call(this, qs);
      rq = createRequests.call(this, urls);
      return getFilesByAPIByFetchAll.call(this, rq[0], [], rq[1]);
    };

    createRequests = function(urls) {
      var i, k, offset, ref, reqForFetchApp, reqs, sep, urlBk, urlsLen, urlss;
      reqForFetchApp = [];
      urlBk = [];
      urlsLen = urls.length;
      if (urlsLen < this.maxBatchRequests) {
        urlBk.push(urls);
        reqs = createBatchRequests.call(this, urls);
        reqForFetchApp.push(reqs);
      } else {
        sep = Math.floor(urlsLen / this.maxBatchRequests);
        sep = urlsLen % this.maxBatchRequests > 0 ? sep + 1 : sep;
        for (i = k = 0, ref = sep; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
          offset = i * this.maxBatchRequests;
          urlss = urls.slice(offset, offset + this.maxBatchRequests);
          urlBk.push(urlss);
          reqs = createBatchRequests.call(this, urlss);
          reqForFetchApp.push(reqs);
        }
      }
      return [reqForFetchApp, urlBk];
    };

    getFilesByAPIInit = function(qs) {
      return qs.map((q) => {
        var query;
        query = {
          pageSize: this.pageSize,
          q: q,
          fields: this.fields
        };
        return this.url + "?" + (objToQueryParams.call(this, query)) + "&" + this.additionalQuery;
      });
    };

    singleReq = function(query) {
      var params, req;
      params = objToQueryParams.call(this, query);
      req = {
        method: "get",
        url: this.url + "?" + params + "&" + this.additionalQuery,
        headers: this.headers,
        muteHttpExceptions: true
      };
      return getFilesByAPIByFetchAllforNoBatch.call(this, [req], []);
    };

    getFilesByAPIByFetchAll = function(reqs, fileList, urlBk) {
      var err, ntoken, response, rq, urls;
      response = UrlFetchApp.fetchAll(reqs);
      err = response.filter(function(e) {
        return e.getResponseCode() !== 200;
      });
      if (err.length > 0) {
        throw new Error(err.length + " errors occurred. ErrorMessage: " + err.toString());
        return;
      }
      ntoken = [];
      response.forEach(function(e, i) {
        var res;
        res = parseResFromBatchRequests.call(this, e.getContentText());
        res.forEach(function(f, j) {
          var token;
          if (f.status !== 200) {
            throw new Error("It's incomplete data. Status is " + f.status);
            return;
          }
          Array.prototype.push.apply(fileList, f.object.files);
          token = f.object.nextPageToken;
          if (token) {
            ntoken.push([i, j, encodeURIComponent(token)]);
          }
        });
      });
      if (ntoken.length > 0) {
        urls = ntoken.map(function(e) {
          var url;
          url = urlBk[e[0]][e[1]];
          if (~url.indexOf("pageToken=")) {
            url = url.replace(/pageToken=[\\W]+?(?=[&|\n])/, "pageToken=" + e[2]);
          } else {
            url += "&pageToken=" + e[2];
          }
          return url;
        });
        rq = createRequests.call(this, urls);
        getFilesByAPIByFetchAll.call(this, rq[0], fileList, rq[1]);
      }
      return fileList;
    };

    getFilesByAPIByFetchAllforNoBatch = function(reqs, fileList) {
      var err, ntoken, reqss, res;
      res = UrlFetchApp.fetchAll(reqs);
      err = res.filter(function(e) {
        return e.getResponseCode() !== 200;
      });
      if (err.length > 0) {
        throw new Error(err.length + " errors occurred. ErrorMessage: " + err.toString());
        return;
      }
      ntoken = [];
      res.forEach(function(e, i) {
        var token;
        r = JSON.parse(e.getContentText());
        Array.prototype.push.apply(fileList, r.files);
        token = r.nextPageToken;
        if (token) {
          ntoken.push([i, encodeURIComponent(token)]);
        }
      });
      if (ntoken.length > 0) {
        reqss = ntoken.map(function(e) {
          var req;
          req = reqs.filter(function(f, j) {
            return j === e[0];
          });
          if (~req[0].url.indexOf("pageToken=")) {
            req[0].url = req[0].url.replace(/pageToken=[\\W]+?(?=[&|\n])/, "pageToken=" + e[1]);
          } else {
            req[0].url += "&pageToken=" + e[1];
          }
          return req[0];
        });
        getFilesByAPIByFetchAllforNoBatch.call(this, reqss, fileList);
      }
      return fileList;
    };

    getRoot = function() {
      return idToName.call(this, "root", "id");
    };

    createQ = function(fl, mtlq) {
      var ffs, ffsq;
      ffs = fl.map(function(e) {
        return "'" + e + "' in parents";
      });
      ffsq = "(" + ffs.join(" or ") + ")";
      if (mtlq !== "") {
        return ffsq + " and " + mtlq + " and trashed=false";
      } else {
        return ffsq + " and trashed=false";
      }
    };

    objToQueryParams = function(query) {
      return Object.keys(query).filter(function(e) {
        return query[e];
      }).map(function(e) {
        return e + "=" + encodeURIComponent(query[e]);
      }).join("&");
    };

    getQueryFromMimeTypes = function(mimeTypeList) {
      var mimetypes;
      if (!mimeTypeList || mimeTypeList.length === 0) {
        mimeTypeList = ["\*"];
      }
      if (mimeTypeList.indexOf("\*") > -1) {
        mimetypes = "";
      } else {
        mimetypes = mimeTypeList.map(function(e) {
          return "mimeType='" + e + "'";
        });
      }
      if (mimetypes !== "") {
        return "(" + mimetypes.join(" or ") + ")";
      } else {
        return "";
      }
    };

    checkFields = function(fields) {
      var pos;
      if (fields === "" || fields === "undefined" || (fields == null)) {
        fields = "files(id,name,parents),nextPageToken,kind";
      } else {
        if (!~fields.indexOf("nextPageToken")) {
          fields = fields + ",nextPageToken";
        }
        if ((~fields.indexOf("(") && ~fields.indexOf(")")) && !~fields.indexOf("parents")) {
          pos = fields.indexOf(")");
          fields = fields.slice(0, pos) + ",parents" + fields.slice(pos, fields.length);
        }
      }
      return fields;
    };

    parseFilesByFolderList = function(allFiles, folderList) {
      var allValues, filesLen, foldersLen;
      filesLen = allFiles.length;
      foldersLen = folderList.id.length;
      if (filesLen === 0) {
        return {
          folderTree: folderList,
          filesInFolder: []
        };
      }
      allValues = folderList.id.map(function(e, i) {
        return {
          folderTreeById: e,
          folderTreeByName: folderList.name[i],
          filesInFolder: allFiles.filter(function(f) {
            var ok;
            ok = f.parents.filter(function(g) {
              return g === e[e.length - 1];
            });
            return ok.length > 0;
          })
        };
      });
      return {
        topFolderId: folderList.id[0],
        topFolderName: folderList.name[0],
        totalFilesAndFolders: filesLen,
        totalFiles: filesLen - foldersLen,
        totalFolders: foldersLen,
        files: allValues
      };
    };

    createBatchRequests = function(endpoints) {
      var boundary, contentId, data, lb;
      boundary = "xxxxxFilesAppxxxxx";
      lb = "\r\n";
      contentId = 0;
      data = "--" + boundary + lb;
      endpoints.forEach(function(endpoint) {
        data += "Content-Type: application/http" + lb;
        data += "Content-ID: " + ++contentId + lb + lb;
        data += "GET " + endpoint + lb + lb;
        data += "--" + boundary + lb;
      });
      return {
        method: "post",
        url: "https://www.googleapis.com/batch/drive/v3",
        headers: this.headers,
        contentType: "multipart/mixed; boundary=" + boundary,
        payload: data,
        muteHttpExceptions: true
      };
    };

    parseResFromBatchRequests = function(res) {
      var splittedRes;
      splittedRes = res.split("--batch");
      return splittedRes.slice(1, splittedRes.length - 1).map(function(e) {
        return {
          contentId: Number(e.match(/Content-ID: response-(\d+)/)[1]),
          status: Number(e.match(/HTTP\/\d+.\d+ (\d+)/)[1]),
          object: JSON.parse(e.match(/{[\S\s]+}/)[0])
        };
      });
    };

    idToName = function(id, prop) {
      var req, res;
      req = {
        method: "get",
        url: this.url + "/" + id + "?" + this.additionalQuery,
        headers: this.headers,
        muteHttpExceptions: true
      };
      res = UrlFetchApp.fetchAll([req]);
      if (res[0].getResponseCode() !== 200) {
        throw new Error("Errors occurred. ErrorMessage: " + res[0].getContentText());
        return;
      }
      return JSON.parse(res[0].getContentText())[prop];
    };

    getDriveId = function(id) {
      var req, res;
      req = {
        method: "get",
        url: this.url + "/" + id + "?" + this.additionalQuery,
        headers: this.headers,
        muteHttpExceptions: true
      };
      res = UrlFetchApp.fetchAll([req]);
      if (res[0].getResponseCode() !== 200) {
        throw new Error("Errors occurred. ErrorMessage: " + res[0].getContentText());
        return;
      }
      return JSON.parse(res[0].getContentText()).driveId || "";
    };

    return FilesApp;

  }).call(this);
  return r.FilesApp = FilesApp;
})(this);
