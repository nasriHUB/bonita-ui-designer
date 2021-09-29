package org.bonitasoft.web.designer.rendering.angular;

import org.bonitasoft.web.designer.config.WorkspaceProperties;
import org.bonitasoft.web.designer.repository.WidgetRepository;
import org.bonitasoft.web.designer.visitor.WidgetIdVisitor;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Set;

import static org.bonitasoft.web.designer.builder.PageBuilder.aPage;
import static org.bonitasoft.web.designer.builder.WidgetBuilder.aWidget;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class WidgetBundleFileTest {

    @Rule
    public TemporaryFolder temporaryFolder = new TemporaryFolder();

    private WidgetBundleFile widgetBundleFile;

    @Mock
    private WidgetRepository widgetRepository;

    @Mock
    private WorkspaceProperties workspaceProperties;

    @Mock
    private WidgetIdVisitor widgetIdVisitor;

    @Before
    public void setup(){
        var widgets = new WorkspaceProperties.Widgets();
        widgets.setDir(Paths.get(temporaryFolder.getRoot().getPath()));
        when(workspaceProperties.getWidgets()).thenReturn(widgets);
        widgetBundleFile = new WidgetBundleFile(workspaceProperties,widgetRepository,widgetIdVisitor);
    }

    @Test
    public void should_return_absolute_path_of_widgets_bundle_files() throws IOException {
        // A fake page used for this test
        var myPage = aPage().build();
        var widgetsList= Arrays.asList(
                aWidget().withId("uidInput").withJsBundle("assets/js/uidInput.es5.min.js").build(),
                aWidget().withId("uidText").withJsBundle("assets/js/uidText.es5.min.js").build()
        );

        File uidInputFolders = temporaryFolder.newFolder("uidInput", "assets", "js");
        Files.createFile(Paths.get(uidInputFolders.getPath()).resolve("uidInput.es5.min.js"));

        when(widgetIdVisitor.visit(myPage)).thenReturn(Set.of("uidInput","uidText"));
        when(widgetRepository.getByIds(Set.of("uidInput","uidText"))).thenReturn(widgetsList);

        var bundlePaths = widgetBundleFile.getWidgetsBundlePathUsedInArtifact(myPage);

        Assert.assertEquals(bundlePaths.size(),1);
        Assert.assertTrue(bundlePaths.get(0).contains("uidInput.es5.min.js"));

    }
}
