/**
 * Copyright (C) 2015 Bonitasoft S.A.
 * Bonitasoft, 32 rue Gustave Eiffel - 38000 Grenoble
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2.0 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
(function() {

  'use strict';

  angular
    .module('bonitasoft.designer.common.repositories')
    .factory('configuration', configuration);

  function configuration($http) {

    class Configuration {
      constructor() {
        this.isError = false;
        this.baseUrl = './rest/config';
        this.$http = $http;
        this.config = {
          headers: {
            'Content-Type': 'application/json',
          }
        };
        this.configInfo = this.getConfigInfo();
      }

      getConfigInfo() {
        return this.$http.get(`${this.baseUrl}`)
          .then((configInfo) => {
            this.configInfo = configInfo.data;
          });
      }

      getUidVersion() {
        return this.configInfo.uidVersion;
      }

      getModelVersion() {
        return this.configInfo.modelVersion;
      }

      getBdrUrl() {
        return this.configInfo.bdrUrl;
      }

      getAppServerUrl() {
        return this.configInfo.appServerUrl;
      }

      isExperimentalModeEnabled() {
        return this.configInfo.experimentalMode;
      }
    }

    return new Configuration();
  }
})();
