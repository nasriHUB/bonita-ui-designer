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
package org.bonitasoft.web.designer.controller.export.properties;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.inject.Inject;
import javax.inject.Named;

import org.apache.commons.lang3.StringUtils;
import org.bonitasoft.web.designer.config.UiDesignerProperties;
import org.bonitasoft.web.designer.controller.PageResource;
import org.bonitasoft.web.designer.model.page.Page;
import org.bonitasoft.web.designer.rendering.GenerationException;

@Named
public class PagePropertiesBuilder {

    private final PageResource pageResource;

    private UiDesignerProperties uiDesignerProperties;

    @Inject
    public PagePropertiesBuilder(PageResource pageResource, UiDesignerProperties uiDesignerProperties) {
        this.pageResource = pageResource;
        this.uiDesignerProperties = uiDesignerProperties;
    }

    public byte[] build(Page page) throws GenerationException, IOException {
        List<String> resources = pageResource.getResources(page.getId());

        Properties properties = new Properties();
        properties.put("name", "custompage_" + page.getName());
        properties.put("contentType", String.valueOf(page.getType()).toLowerCase(Locale.ENGLISH));
        properties.put("displayName", StringUtils.isBlank(page.getDisplayName())? page.getName() : page.getDisplayName());
        properties.put("description", page.getDescription());
        properties.put("resources", resources.toString());
        properties.put("designerVersion", uiDesignerProperties.getVersion());
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        properties.store(byteArrayOutputStream, "Generated by Bonita UI Designer");

        return byteArrayOutputStream.toByteArray();
    }

}
