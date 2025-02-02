(function() {
  'use strict';

  describe('editor service', function() {
    var $rootScope, $q, widgetRepo, pageRepo, editorService, alerts, components, whiteboardComponentWrapper,
      whiteboardService, dataManagementRepoMock, migration, fragmentRepo;

    var labelWidget = {
      id: 'label',
      custom: false,
      type: 'widget'
    };

    var uidLabelWidget = {
      id: 'uidLabel',
      custom: false,
      type: 'widget',
    };

    var uidInputwidget = {
      id: 'uidInput',
      custom: false,
      type: 'widget',
    };

    let containers = [
      {
        id: 'uidContainer',
        name: 'Container',
        type: 'container'
      }
    ];

    var json = {
      'data': {
        'id': 'person',
        'name': 'person page',
        'rows': [
          [
            {
              'id':'uidContainer',
              'type': 'container',
              'dimension': {'xs': 12},
              'rows': [
                [
                  {
                    'type': 'component',
                    'id': 'label',
                    'dimension': {'xs': 12},
                    'propertyValues': {'text': 'label 1', 'alignment': 'left'}
                  }
                ],
                [
                  {
                    'type': 'component',
                    'id': 'label',
                    'dimension': {'xs': 12},
                    'propertyValues': {'text': 'label 2', 'alignment': 'left'}
                  }
                ],
              ]
            }],
        ]
      }
    };


    beforeEach(angular.mock.module('bonitasoft.designer.editor'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');

      widgetRepo = $injector.get('widgetRepo');
      pageRepo = $injector.get('pageRepo');
      fragmentRepo = $injector.get('fragmentRepo');
      dataManagementRepoMock = $injector.get('dataManagementRepo');

      editorService = $injector.get('editorService');
      components = $injector.get('components');
      whiteboardComponentWrapper = $injector.get('whiteboardComponentWrapper');
      alerts = $injector.get('alerts');
      whiteboardService = $injector.get('whiteboardService');
      migration = $injector.get('migration');
      spyOn(fragmentRepo, 'load').and.returnValue($q.when({}));
      spyOn(fragmentRepo, 'all').and.returnValue($q.when({ data: [{}] }));
      spyOn(fragmentRepo, 'allNotUsingElement').and.returnValue($q.when([{}]));
      spyOn(fragmentRepo, 'getInfo').and.returnValue($q.when({data: {artifactVersion: '3.0'}}));

      spyOn(widgetRepo, 'widgets').and.returnValue($q.when(containers.concat([labelWidget, uidLabelWidget, uidInputwidget])));

      spyOn(dataManagementRepoMock, 'getDataObjects').and.returnValue($q.when({error: false, objects: []}));
      spyOn(alerts, 'addError');
      spyOn(fragmentRepo, 'migrate').and.returnValue($q.when({}));
      spyOn(pageRepo, 'migrate').and.returnValue($q.when({}));
      spyOn(pageRepo, 'getInfo').and.returnValue($q.when({data: {artifactVersion: '3.0'}}));
      spyOn(pageRepo, 'migrationStatus').and.returnValue($q.when({data: {migration: false, compatible: true}}));
    }));

    it('should initialize a page', function() {
      let page = {};
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.when());
      spyOn(migration, 'handleMigrationNotif');
      spyOn(pageRepo, 'load').and.returnValue($q.when(json));
      editorService.initialize(pageRepo, 'person')
        .then(function(data) {
          page = data;
        });

      $rootScope.$apply();

      expect(pageRepo.getInfo).toHaveBeenCalled();
      expect(pageRepo.migrate).not.toHaveBeenCalled();

      expect(page.rows[0][0].$$id).toBe('uidContainer-0');
      expect(page.rows[0][0].$$widget.name).toBe('Container');
      expect(page.rows[0][0].rows[0][0].$$id).toBe('component-0');
      expect(page.rows[0][0].rows[0][0].$$widget).toEqual(labelWidget);
      expect(page.rows[0][0].rows[0][0].$$parentContainerRow.container).toBe(page.rows[0][0]);
      expect(page.rows[0][0].rows[0][0].$$parentContainerRow.row).toBe(page.rows[0][0].rows[0]);
      expect(page.rows[0][0].rows[1][0].$$parentContainerRow.container).toBe(page.rows[0][0]);
      expect(page.rows[0][0].rows[1][0].$$parentContainerRow.row).toBe(page.rows[0][0].rows[1]);
    });

    it('should init components', function() {
      spyOn(components, 'register');
      spyOn(components, 'reset');
      spyOn(whiteboardComponentWrapper, 'wrapPage').and.returnValue({});
      spyOn(pageRepo, 'load').and.returnValue($q.when(json));

      editorService.initialize(pageRepo, 'person');
      $rootScope.$apply();

      expect(components.reset).toHaveBeenCalled();
      expect(components.reset.calls.count()).toBe(1);

      expect(components.register).toHaveBeenCalled();
      expect(components.register.calls.count()).toBe(5);
    });

    it('should add an alert if initialize failed', function() {
      let errorMessage = {};
      errorMessage.message = 'load failed';
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.when());
      spyOn(migration, 'handleMigrationNotif');
      spyOn(pageRepo, 'load').and.returnValue($q.reject(errorMessage));

      editorService.initialize(pageRepo, 'person');
      $rootScope.$apply();

      expect(alerts.addError).toHaveBeenCalled();
    });

    it('should add an alert if incompatible migration or migration error', function() {
      let errorMessage = {};
      errorMessage.message = 'incompatible or migration error';
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.reject(errorMessage));

      editorService.initialize(pageRepo, 'person');
      $rootScope.$apply();

      expect(alerts.addError).toHaveBeenCalled();
    });

    it('should remove widget assets from page when widget is not in page anymore', function() {
      var page = {
        assets: [{id: 'anAsset', componentId: 'aWidgget'}],
        rows: []
      };
      spyOn(whiteboardService, 'contains').and.returnValue(false);
      spyOn(pageRepo, 'load').and.returnValue($q.when({data: page}));
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.when());
      spyOn(migration, 'handleMigrationNotif');
      editorService.initialize(pageRepo, 'person');
      $rootScope.$apply();

      editorService.removeAssetsFromPage({id: 'aWidgget'});

      expect(page.assets).toEqual([]);
    });

    it('should not remove widget assets from page when widget still exists in page', function() {
      var page = {
        assets: [{id: 'anAsset', componentId: 'aWidgget'}],
        rows: []
      };
      spyOn(whiteboardService, 'contains').and.returnValue(true);
      spyOn(pageRepo, 'load').and.returnValue($q.when({data: page}));
      editorService.initialize(pageRepo, 'person');
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.when());
      spyOn(migration, 'handleMigrationNotif');
      $rootScope.$apply();

      editorService.removeAssetsFromPage({id: 'aWidgget'});

      expect(page.assets).toContain({id: 'anAsset', componentId: 'aWidgget'});
    });

    it('should migrate a page before initializing', function() {
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.when());
      spyOn(migration, 'handleMigrationNotif');
      pageRepo.migrationStatus = jasmine.createSpy().and.returnValue($q.when({data: {migration: true, compatible: true}}));
      spyOn(pageRepo, 'load').and.returnValue($q.when(json));

      editorService.initialize(pageRepo, 'person');
      $rootScope.$apply();

      expect(pageRepo.migrate).toHaveBeenCalled();
      expect(migration.handleMigrationNotif).toHaveBeenCalled();
    });

    it('should not call migrate when user click on cancel in migration popup', function() {
      spyOn(migration, 'handleMigrationStatus').and.returnValue($q.reject('cancel'));
      spyOn(migration, 'handleMigrationNotif');
      pageRepo.migrationStatus = jasmine.createSpy().and.returnValue($q.when({data: {migration: true, compatible: true}}));
      spyOn(pageRepo, 'load').and.returnValue($q.when(json));

      editorService.initialize(pageRepo, 'person');

      $rootScope.$apply();

      expect(pageRepo.migrate).not.toHaveBeenCalled();
      expect(migration.handleMigrationNotif).not.toHaveBeenCalled();
    });
  });
})();
