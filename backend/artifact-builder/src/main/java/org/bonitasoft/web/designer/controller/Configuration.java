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

package org.bonitasoft.web.designer.controller;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Configuration {

    private String uidVersion;
    private String modelVersion;
    private String modelVersionLegacy;
    private String bdrUrl;
    private String appServerUrl;
    private boolean experimentalMode;

    @Override
    public String toString() {
        return "{" +
                "\"uidVersion\":" + uidVersion +
                ",\"modelVersion\":" + modelVersion +
                ",\"modelVersionLegacy\":" + modelVersionLegacy +
                ",\"bdrUrl\":" + bdrUrl +
                ",\"appServerUrl\":" + appServerUrl +
                ",\"experimentalMode\":" + experimentalMode +
                '}';
    }
}
