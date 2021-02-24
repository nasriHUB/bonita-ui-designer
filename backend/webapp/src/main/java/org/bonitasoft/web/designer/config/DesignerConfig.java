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
package org.bonitasoft.web.designer.config;

import java.util.List;
import java.util.Map;

import javax.validation.Validation;
import javax.validation.Validator;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import org.bonitasoft.web.designer.controller.asset.AssetService;
import org.bonitasoft.web.designer.controller.export.Exporter;
import org.bonitasoft.web.designer.controller.export.steps.ExportStep;
import org.bonitasoft.web.designer.controller.export.steps.FragmentPropertiesExportStep;
import org.bonitasoft.web.designer.controller.export.steps.FragmentsExportStep;
import org.bonitasoft.web.designer.controller.export.steps.WidgetByIdExportStep;
import org.bonitasoft.web.designer.controller.export.steps.WidgetsExportStep;
import org.bonitasoft.web.designer.controller.importer.ArtifactImporter;
import org.bonitasoft.web.designer.controller.importer.dependencies.AssetImporter;
import org.bonitasoft.web.designer.controller.importer.dependencies.FragmentImporter;
import org.bonitasoft.web.designer.controller.importer.dependencies.WidgetImporter;
import org.bonitasoft.web.designer.migration.JacksonDeserializationProblemHandler;
import org.bonitasoft.web.designer.model.DesignerArtifact;
import org.bonitasoft.web.designer.model.JacksonObjectMapper;
import org.bonitasoft.web.designer.model.fragment.Fragment;
import org.bonitasoft.web.designer.model.page.Component;
import org.bonitasoft.web.designer.model.page.Container;
import org.bonitasoft.web.designer.model.page.FormContainer;
import org.bonitasoft.web.designer.model.page.FragmentElement;
import org.bonitasoft.web.designer.model.page.ModalContainer;
import org.bonitasoft.web.designer.model.page.Page;
import org.bonitasoft.web.designer.model.page.TabContainer;
import org.bonitasoft.web.designer.model.page.TabsContainer;
import org.bonitasoft.web.designer.model.widget.Widget;
import org.bonitasoft.web.designer.rendering.DirectiveFileGenerator;
import org.bonitasoft.web.designer.repository.AssetRepository;
import org.bonitasoft.web.designer.repository.BeanValidator;
import org.bonitasoft.web.designer.repository.FragmentRepository;
import org.bonitasoft.web.designer.repository.JsonFileBasedLoader;
import org.bonitasoft.web.designer.repository.JsonFileBasedPersister;
import org.bonitasoft.web.designer.repository.PageRepository;
import org.bonitasoft.web.designer.repository.Repository;
import org.bonitasoft.web.designer.repository.WidgetFileBasedLoader;
import org.bonitasoft.web.designer.repository.WidgetFileBasedPersister;
import org.bonitasoft.web.designer.repository.WidgetRepository;
import org.bonitasoft.web.designer.service.BondsTypesFixer;
import org.bonitasoft.web.designer.service.FragmentService;
import org.bonitasoft.web.designer.service.PageService;
import org.bonitasoft.web.designer.service.WidgetService;
import org.bonitasoft.web.designer.visitor.FragmentIdVisitor;
import org.bonitasoft.web.designer.visitor.WidgetIdVisitor;
import org.fedorahosted.tennera.jgettext.PoParser;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

/**
 * @author Guillaume EHRET
 */
@Configuration
@EnableScheduling
public class DesignerConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        //By default all properties without explicit view definition are included in serialization.
        //To use JsonView we have to change this parameter
        objectMapper.configure(MapperFeature.DEFAULT_VIEW_INCLUSION, false);

        //We don't have to serialize null values
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        objectMapper.registerModule(new JodaModule());
        objectMapper.registerSubtypes(
                FragmentElement.class, Component.class, Container.class, FormContainer.class, TabsContainer.class, TabContainer.class, ModalContainer.class
        );

        //add Handler to migrate old json
        objectMapper.addHandler(new JacksonDeserializationProblemHandler());

        //disable filter name check so that filtering is optional
        SimpleFilterProvider simpleFilterProvider = new SimpleFilterProvider();
        simpleFilterProvider.setFailOnUnknownId(false);
        objectMapper.setFilterProvider(simpleFilterProvider);

        return objectMapper;
    }

    /**
     * We use our own jackson object Mapper
     */
    @Bean
    public JacksonObjectMapper objectMapperWrapper() {
        return new JacksonObjectMapper(objectMapper());
    }

    /**
     * Used by internationalisation to work on PO files
     */
    @Bean
    public PoParser poParser() {
        return new PoParser();
    }

    @Bean
    public BeanValidator beanValidator() {
        //For the bean Widget the
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        return new BeanValidator(validator);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public JsonFileBasedPersister<Page> pageFileBasedPersister(UiDesignerProperties uiDesignerProperties) {
        return new JsonFileBasedPersister<>(objectMapperWrapper(), beanValidator(),uiDesignerProperties);
    }

    @Bean
    public JsonFileBasedPersister<Widget> widgetFileBasedPersister(UiDesignerProperties uiDesignerProperties) {
        return new WidgetFileBasedPersister(objectMapperWrapper(), beanValidator(),uiDesignerProperties);
    }

    @Bean
    public JsonFileBasedPersister<Fragment> fragmentFileBasedPersister(UiDesignerProperties uiDesignerProperties) {
        return new JsonFileBasedPersister<>(objectMapperWrapper(), beanValidator(),uiDesignerProperties);
    }

    @Bean
    public JsonFileBasedLoader<Page> pageFileBasedLoader() {
        return new JsonFileBasedLoader<>(objectMapperWrapper(), Page.class);
    }

    @Bean
    public JsonFileBasedLoader<Fragment> fragmentFileBasedLoader() {
        return new JsonFileBasedLoader<>(objectMapperWrapper(), Fragment.class);
    }

    @Bean
    public AssetImporter<Page> pageAssetImporter(AssetRepository<Page> pageAssetRepository) {
        return new AssetImporter<>(pageAssetRepository);
    }

    @Bean
    public AssetImporter<Widget> widgetAssetImporter(AssetRepository<Widget> widgetAssetRepository) {
        return new AssetImporter<>(widgetAssetRepository);
    }

    @Bean
    public ArtifactImporter<Page> pageArtifactImporter(PageRepository pageRepository, PageService pageService, FragmentImporter fragmentImporter,
            WidgetImporter widgetImporter, AssetImporter<Page> pageAssetImporter) {
        return new ArtifactImporter<>(pageRepository, pageService, pageFileBasedLoader(), fragmentImporter, widgetImporter, pageAssetImporter);
    }

    @Bean
    public ArtifactImporter<Widget> widgetArtifactImporter(WidgetFileBasedLoader widgetLoader, WidgetRepository widgetRepository,
            WidgetService widgetService,
            AssetImporter<Widget> widgetAssetImporter) {
        return new ArtifactImporter<>(widgetRepository, widgetService, widgetLoader, widgetAssetImporter);
    }

    @Bean
    public Map<String, ArtifactImporter<? extends DesignerArtifact>> artifactImporters(
            ArtifactImporter<Page> pageArtifactImporter,
            ArtifactImporter<Widget> widgetArtifactImporter,
            ArtifactImporter<Fragment> fragmentArtifactImporter) {
        return ImmutableMap.<String, ArtifactImporter<? extends DesignerArtifact>>builder()
                .put("page", pageArtifactImporter)
                .put("widget", widgetArtifactImporter)
                .put("fragment", fragmentArtifactImporter)
                .build();
    }

    @Bean
    public WidgetsExportStep<Page> widgetsExportStep(WorkspaceProperties workspaceProperties, WidgetIdVisitor widgetIdVisitor, DirectiveFileGenerator directiveFileGenerator) {
        return new WidgetsExportStep<>(workspaceProperties.getWidgets().getDir(), widgetIdVisitor, directiveFileGenerator);
    }

    @Bean
    public Exporter<Page> pageExporter(PageRepository pageRepository, PageService pageService, ExportStep<Page>[] pageExportSteps) {
        return new Exporter<>(pageRepository, pageService, pageExportSteps);
    }

    @Bean
    public Exporter<Widget> widgetExporter(WidgetRepository widgetRepository, WidgetService widgetService, WidgetByIdExportStep widgetByIdExportStep) {
        return new Exporter<>(widgetRepository, widgetService, widgetByIdExportStep);
    }

    @Bean
    public AssetRepository<Page> pageAssetRepository(PageRepository pageRepository) {
        return new AssetRepository<>(pageRepository, beanValidator());
    }

    @Bean
    public AssetRepository<Widget> widgetAssetRepository(WidgetRepository widgetRepository) {
        return new AssetRepository<>(widgetRepository, beanValidator());
    }

    @Bean
    public AssetService<Page> pageAssetService(PageRepository pageRepository) {
        return new AssetService<>(pageRepository, pageAssetRepository(pageRepository),
                pageAssetImporter(pageAssetRepository(pageRepository)),
                objectMapperWrapper());
    }

    @Bean
    public AssetService<Widget> widgetAssetService(WidgetRepository widgetRepository) {
        return new AssetService<>(widgetRepository, widgetAssetRepository(widgetRepository),
                widgetAssetImporter(widgetAssetRepository(widgetRepository)),
                objectMapperWrapper());
    }

    @Bean
    public BondsTypesFixer<Page> pageBondsTypesFixer(PageRepository pageRepository) {
        return new BondsTypesFixer<>(pageRepository);
    }

    @Bean
    public ArtifactImporter<Fragment> fragmentArtifactImporter(FragmentRepository fragmentRepository, FragmentService fragmentService, FragmentImporter fragmentImporter, WidgetImporter widgetImporter) {
        return new ArtifactImporter<Fragment>(fragmentRepository, fragmentService, fragmentFileBasedLoader(), fragmentImporter, widgetImporter);
    }

    @Bean
    public FragmentsExportStep<Page> fragmentsExportStep(FragmentIdVisitor fragmentIdVisitor, WorkspaceProperties workspaceProperties, FragmentPropertiesExportStep fragmentPropertiesExportStep) {
        return new FragmentsExportStep<>(fragmentIdVisitor, workspaceProperties.getFragments().getDir(), fragmentPropertiesExportStep);
    }

    @Bean
    public WidgetsExportStep<Fragment> widgetsExportStepFragment(WorkspaceProperties workspaceProperties, WidgetIdVisitor widgetIdVisitor, DirectiveFileGenerator directiveFileGenerator) {
        return new WidgetsExportStep<>(workspaceProperties.getWidgets().getDir(), widgetIdVisitor, directiveFileGenerator);
    }

    @Bean
    public FragmentsExportStep<Fragment> fragmentsExportStepFragment(FragmentIdVisitor fragmentIdVisitor, WorkspaceProperties workspaceProperties, FragmentPropertiesExportStep fragmentPropertiesExportStep) {
        return new FragmentsExportStep<>(fragmentIdVisitor, workspaceProperties.getFragments().getDir(), fragmentPropertiesExportStep);
    }

    @Bean
    public Exporter<Fragment> fragmentExporter(FragmentRepository fragmentRepository, FragmentService fragmentService, JacksonObjectMapper objectMapper, WidgetsExportStep<Fragment> widgetsExportStepFragment, FragmentsExportStep<Fragment> fragmentsExportStepFragment) {
        return new Exporter(fragmentRepository, fragmentService, widgetsExportStepFragment, fragmentsExportStepFragment);
    }

    @Bean
    public List<Repository> fragmentsUsedByRepositories(PageRepository pageRepository, FragmentRepository fragmentRepository) {
        return Lists.newArrayList(pageRepository, fragmentRepository);
    }

    @Bean
    public BondsTypesFixer<Fragment> fragmentBondsTypesFixer(FragmentRepository fragmentRepository) {
        return new BondsTypesFixer<>(fragmentRepository);
    }

}
