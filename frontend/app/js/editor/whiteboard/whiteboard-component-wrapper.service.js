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
    .module('bonitasoft.designer.editor.whiteboard')
    .service('whiteboardComponentWrapper', whiteboardComponentWrapper);

  function whiteboardComponentWrapper(whiteboardService, components, componentId) {

    var service = {
      wrapPage,
      wrapWidget,
      wrapContainer,
      wrapUidContainer,
      wrapTabsContainer,
      wrapTabContainer,
      wrapModalContainer,
      wrapFormContainer,
      wrapFragment
    };
    return service;

    /**
     * Initializes a row coming from the server.
     */
    function wrapRow(container, row) {
      var parentContainerRow = {
        container: container,
        row: row
      };
      angular.forEach(row, function(component) {
        components.init(component, parentContainerRow);
      });
    }

    function wrapPage(page) {
      page.rows.forEach(wrapRow.bind(null, page));
    }

    /**
     * Initialize (mutate) a component to be used in whiteboard
     * component can come from a page definition or from createWidget
     * @param  {Object} widget    Widget configuration
     * @param  {Object} element      Widget instance
     * @param  {Object} parentRow parent row container
     */
    function wrapWidget(widget, element, parentRow) {
      // The $$ prefix makes sure the attribute is not serialized to JSON
      // $$id is only used by e2e tests
      // $$widget is a direct reference to the widget identified by widgetId. Only widgetId needs to be serialized
      // $$templateUrl is  used in container.html to display the component
      // $$parentContainerRow is a backward reference to the containing container and row, which is only useful in the
      // editor, but must not and can not be serialized (cyclic reference)
      var w = angular.extend(element, {
        $$id: componentId.getNextId('component'),
        $$widget: angular.copy(widget), // make sure to render all properties every time we select a component
        $$templateUrl: 'js/editor/whiteboard/component-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/component-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveWidget.bind(null, element),
        triggerAdded: whiteboardService.onAddWidget.bind(null, element)
      });
      whiteboardService.triggerInitWidget(w);
      return w;
    }

    function wrapContainer(container, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(container.id),
        $$widget: angular.copy(container),
        $$templateUrl: 'js/editor/whiteboard/container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/container-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveContainer.bind(null, element),
        triggerAdded: angular.noop
      });
      component.rows.forEach(wrapRow.bind(null, element));
      return component;
    }

    function wrapUidContainer(container, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(container.id),
        $$widget: angular.copy(container),
        $$templateUrl: 'js/editor/whiteboard/container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/uid-container-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveContainer.bind(null, element),
        triggerAdded: angular.noop
      });
      component.rows.forEach(wrapRow.bind(null, element));
      return component;
    }

    function wrapTabsContainer(tabsContainer, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(tabsContainer.id),
        $$widget: angular.copy(tabsContainer),
        $$templateUrl: 'js/editor/whiteboard/tabs-container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/component-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveTabsContainer.bind(null, element),
        triggerAdded: whiteboardService.onAddTabsContainer.bind(null, element),
      });

      var tabContainer = components.getById('pbTabContainer').component;
      element.tabList.forEach(function(tabElement) {
        service.wrapTabContainer(tabContainer, tabElement, parentRow);
      });

      return component;
    }

    function wrapTabContainer(tabContainer, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(tabContainer.id),
        $$widget: angular.copy(tabContainer),
        $$templateUrl: 'js/editor/whiteboard/container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/tab-container-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveTabContainer.bind(null, element),
        triggerAdded: angular.noop
      });

      service.wrapContainer({ id: 'pbContainer' }, element.container);
      return component;
    }

    function wrapFormContainer(formContainer, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(formContainer.id),
        $$widget: angular.copy(formContainer),
        $$templateUrl: 'js/editor/whiteboard/form-container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/component-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveFormContainer.bind(null, element),
        triggerAdded: angular.noop
      });

      service.wrapContainer({ id: 'pbContainer' }, element.container);
      return component;
    }

    function wrapModalContainer(modalContainer, element, parentRow) {
      var component = angular.extend(element, {
        $$id: componentId.getNextId(modalContainer.id),
        $$widget: angular.copy(modalContainer),
        $$templateUrl: 'js/editor/whiteboard/modal-container-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/modal-container-properties-template.html',
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveModalContainer.bind(null, element),
        triggerAdded: whiteboardService.onAddModalContainer.bind(null, element),
      });
      service.wrapContainer({ id: 'pbContainer' }, element.container);
      return component;
    }

    function wrapFragment(definition, fragment, parentRow) {
      let widg = angular.copy(definition);
      let extended = angular.extend(fragment, {
        $$id: componentId.getNextId('fragment'),
        $$templateUrl: 'js/editor/whiteboard/fragment-template.html',
        $$propertiesTemplateUrl: 'js/editor/properties-panel/fragment/fragment-properties-template.html',
        $$widget: widg,
        $$parentContainerRow: parentRow,
        triggerRemoved: whiteboardService.onRemoveContainer.bind(null, widg),
        triggerAdded: whiteboardService.onAddWidget.bind(null, fragment)
      });

      service.wrapContainer({}, extended.$$widget);

      whiteboardService.triggerInitWidget(extended);
      return extended;
    }

  }
})
();
