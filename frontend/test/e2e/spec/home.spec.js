import {default as HomePage} from '../pages/home.page';

describe('home page', function() {

  var home;
  const PAGE_NAMES = [ 'Person', 'fragInFragInFrag', 'empty','aPageToMigrate', 'aPageIncompatible'];
  const WIDGET_NAMES = [ 'awesomeWidget', 'favoriteWidget' ];
  const FRAGMENT_NAMES = [ 'fragWithTitleFrag', 'simpleFragment', 'personFragment', 'empty' ];

  beforeEach(function() {
    home = HomePage.get();
  });

  it('should list artifacts ordered by last update date descendant', function() {
    expect(home.getListedPageNames()).toEqual(PAGE_NAMES);
    expect(home.getListedWidgetNames()).toEqual(WIDGET_NAMES);
    expect(home.getListedFormNames()).toEqual(['emptyForm']);
    expect(home.getListedLayoutNames()).toEqual(['emptyLayout']);
  });

  it('should list favorite artifacts ordered by last update date descendant', function() {
    expect(home.getFavoritePageNames()).toEqual(['Person']);
    expect(home.getFavoriteWidgetNames()).toEqual(['favoriteWidget']);
  });

  it('should navigate to a page', function() {
    $$('.ArtifactList-page a').first().click();

    expect($('.EditorHeader-brand').getText()).toBe('PAGE EDITOR');
    $('.EditorHeader-homeNav').click();
    expect($('.HomeHeader-title').getText()).toBe('UI Designer');
  });

  it('should navigate to a widget if legacy', function() {
    $$('.ArtifactList-widget a').first().click();

    expect($('.EditorHeader-brand').getText()).toBe('WIDGET EDITOR');
  });

  it('should create a layout', function() {
    home.createLayout('testLayout');
    expect($('.EditorHeader-brand').getText()).toBe('LAYOUT EDITOR');
    browser.get('#/');
    home.openTab('layout');
    $$('.ArtifactList-layout a').first().click();
    $$('.BottomPanel-tab').last().click();

    expect($('.EditorHeader-brand').getText()).toBe('LAYOUT EDITOR');

    $('#save').click();
    $$('.EditorHeader-back').click();
    expect($('.HomeHeader-title').getText()).toBe('UI Designer');
  });

  it('should create a form', function() {
    home.createForm('testForm');
    expect($('.EditorHeader-brand').getText()).toBe('FORM EDITOR');
    browser.get('#/');
    home.openTab('form');
    $$('.ArtifactList-form a').first().click();
    $$('.BottomPanel-tab').last().click();

    expect($('.EditorHeader-brand').getText()).toBe('FORM EDITOR');

    $('#save').click();
    $('.EditorHeader-homeNav').click();
    expect($('.HomeHeader-title').getText()).toBe('UI Designer');
  });

  it('should create a page', function() {
    home.createPage('testPage');
    expect($('.EditorHeader-brand').getText()).toBe('PAGE EDITOR');
  });

  it('should not have the legacy checkbox when create a page in non-experimental mode', function() {
    $('.HomeCreate').click();
    let nameInput = $('.modal-body input[name="name"]');
    let legacyCheckBox = $('.modal-body input[name="legacy"]');
    expect(nameInput.isPresent()).toBeTruthy();
    expect(legacyCheckBox.isPresent()).toBeFalsy();
  });

  it('should create a widget with widget tab selected', function() {
    home.openTab('widget');
    home.createDefault('testWidget');
    expect($('.EditorHeader-brand').getText()).toBe('WIDGET EDITOR');
  });

  it('should not create a page with space or special characters in name', function() {
    $('.HomeCreate').click();
    let nameInput = $('.modal-body input[name="name"]');
    nameInput.sendKeys('page name');
    let createPageButton = $('.modal-footer button[type="submit"]');
    expect(createPageButton.isEnabled()).toBeFalsy();
    expect($('.NewArtifact .tooltip-inner').isDisplayed()).toBeTruthy();

    nameInput.clear();
    nameInput.sendKeys('page-name');

    expect(createPageButton.isEnabled()).toBeFalsy();
    expect($('.NewArtifact .tooltip-inner').isDisplayed()).toBeTruthy();

    nameInput.clear();
    nameInput.sendKeys('pageName');

    expect(createPageButton.isEnabled()).toBeTruthy();
    expect($$('.NewArtifact .tooltip-inner').count()).toBe(0);
  });

  it('should not create a page with page name is already exist', function() {
    $('.HomeCreate').click();
    let nameInput = $('.modal-body input[name="name"]');
    nameInput.sendKeys('Person');
    let createPageButton = $('.modal-footer button[type="submit"]');
    expect(createPageButton.isEnabled()).toBeFalsy();
    expect($('.NewArtifact .tooltip-inner').isDisplayed()).toBeTruthy();

    nameInput.clear();
    nameInput.sendKeys('Person');

    expect(createPageButton.isEnabled()).toBeFalsy();
    expect($('.NewArtifact .tooltip-inner').isDisplayed()).toBeTruthy();
  });

  it('should create a widget', function() {
    home.createWidget('test');
    expect($('.EditorHeader-brand').getText()).toBe('WIDGET EDITOR');
  });

  it('should change sort order ', () => {
    expect($('.switcher').getAttribute('class')).toContain('active');
    $('.switcher .fa.fa-sort-alpha-asc').click();

    expect(home.getListedPageNames()).toEqual([...PAGE_NAMES].reverse());
    expect(home.getFavoriteArtifactNames()).toEqual(['favoriteWidget', 'Person', 'personFragment']);
    expect(home.getListedWidgetNames()).toEqual(WIDGET_NAMES);

    //check the storage keeps the selected sort order
    home = HomePage.get();
    expect($('.switcher').getAttribute('class')).not.toContain('active');

    $('.switcher .fa.fa-calendar').click();
    expect($('.switcher').getAttribute('class')).toContain('active');
    expect(home.getListedWidgetNames()).toEqual(WIDGET_NAMES);
    expect(home.getListedPageNames()).toEqual(PAGE_NAMES);
    expect(home.getFavoriteArtifactNames()).toEqual(['Person', 'personFragment', 'favoriteWidget']);
  });

  it('should forbid to create a widget with an already existing name', function() {
    $('.HomeCreate').click();
    element(by.css('#type-widget')).click();
    $('.modal-body input[name="name"]').sendKeys('awesomeWidget');
    expect($('.modal-footer button[type="submit"]').isEnabled()).toBeFalsy();
    expect($('.tooltip-inner').getText()).toEqual('This name already exists');
  });

  it('should open a modal to confirm page deletion', function() {
    //We want to delete a page
    $$('#personPage .Artifact-delete').first().click();
    //A modal is opened with a confirmation message
    expect($('#confirm-delete-popup .modal-body').getText()).toBe('Are you sure you want to delete the page Person?');
  });

  it('should not delete page if user cancels deletion', function() {
    var numberOfPages = element.all(by.repeater('page in pages')).count();
    //We want to delete a page
    $$('#personPage .Artifact-delete').first().click();
    //A modal is opened and I click on Cancel

    //Disable animation for modal
    $$('#confirm-delete-popup').allowAnimations(false);

    $$('#confirm-delete-popup .modal-footer button[name=cancel]').get(0).click();
    browser.waitForAngular();
    expect($$('#confirm-delete-popup').count()).toBe(0);
    //and the page is not deleted
    var newNumberOfPages = element.all(by.repeater('page in pages')).count();
    expect(newNumberOfPages).toBe(numberOfPages);

  });

  it('should export a page', function() {
    var btn = $$('#personPage .Artifact-export').first();
    btn.click();

    $$('.EditorHeader-exportForm .modal-footer button[name=export]').get(0).click();
    browser.ignoreSynchronization = true;

    expect($$('.EditorHeader-exportForm').count()).toBe(0);
    browser.ignoreSynchronization = false;
  });

  it('should open a modal to confirm widget deletion', function() {
    home.openTab('widget');

    expect($('#customAwesomeWidget .Artifact-icon identicon').isPresent()).toBeTruthy();
    //We want to delete a widget
    $$('#customAwesomeWidget .Artifact-delete').first().click();
    //A modal is opened with a confirmation message
    expect($('#confirm-delete-popup .modal-body').getText()).toBe('Are you sure you want to delete the widget awesomeWidget?');
  });

  it('should rename a page', function() {

    var btnRenamePage = $$('#personPage .Artifact-rename').first();
    btnRenamePage.click();

    //The link should now be a visible input with the page name
    var nameInput = $('#page-name-input-0');
    expect(nameInput.getAttribute('value')).toBe('Person');
    //We can change the name
    nameInput.sendKeys('2');
    // It should remove the input
    btnRenamePage.click();
    expect(nameInput.isPresent()).toBe(false);
  });

  it('should not rename a page with space or special characters in name', function() {
    $$('#personPage .Artifact-rename').first().click();

    //The link should now be a visible input with the page name
    $('#page-name-input-0').clear();
    $('#page-name-input-0').sendKeys('page name');

    expect($('.ArtifactList-page form[name="renameArtifact"] .tooltip-inner').isDisplayed()).toBeTruthy();

    $('#page-name-input-0').clear();
    $('#page-name-input-0').sendKeys('page-name');

    expect($('.ArtifactList-page form[name="renameArtifact"] .tooltip-inner').isDisplayed()).toBeTruthy();

    $('#page-name-input-0').clear();
    $('#page-name-input-0').sendKeys('pageName');

    expect($$('.ArtifactList-page form[name="renameArtifact"] .tooltip-inner').count()).toBe(0);
  });

  it('should remove the input to rename a page on blur', function() {

    $$('#personPage .Artifact-rename').first().click();

    //The link should now be a visible input with the page name
    var nameInput = $('#page-name-input-0');
    expect(nameInput.isPresent()).toBe(true);

    browser
      .executeScript('$(\'#page-name-input-0\').blur();')
      .then(function() {
        expect(nameInput.isPresent()).toBe(false);
      });

  });

  it('should set autofocus on the input if we edit a page',  function() {
    $$('#personPage .Artifact-rename').first().click();
    var input = $('#page-name-input-0');
    expect(input.getAttribute('id')).toEqual(browser.driver.switchTo().activeElement().getAttribute('id'));
  });

  it('should open help popup',  function() {
    $('.btn-bonita-help').click();

    expect($('.modal-header .modal-title').getText()).toBe('Help');
  });

  it('should filter widgets, pages and fragment by name', function() {
    expect(home.getTabCounter('page')).toEqual('5');
    expect(home.getTabCounter('widget')).toEqual('2');
    expect(home.getTabCounter('layout')).toEqual('1');
    expect(home.getTabCounter('form')).toEqual('1');
    home.search('noWidgetNoPagesAndNoFragmentHasANameLikeThat');
    expect(home.getListedPageNames()).toEqual([]);
    expect(home.getListedWidgetNames()).toEqual([]);
    expect(home.getListedLayoutNames()).toEqual([]);
    expect(home.getListedFormNames()).toEqual([]);
    expect(home.getFavoritePageNames()).toEqual([]);
    expect(home.getFavoriteWidgetNames()).toEqual([]);
    expect(home.getTabCounter('page')).toEqual('0');
    expect(home.getTabCounter('widget')).toEqual('0');
    expect(home.getTabCounter('layout')).toEqual('0');
    expect(home.getTabCounter('form')).toEqual('0');

    home.search('so');   // 'so' is contained by 'PerSOn' and 'aweSOmeWidget'
    expect(home.getFavoritePageNames()).toEqual(['Person']);
    expect(home.getListedWidgetNames()).toEqual(['awesomeWidget']);
    expect(home.getTabCounter('page')).toEqual('1');
    expect(home.getTabCounter('widget')).toEqual('1');
    expect(home.getTabCounter('layout')).toEqual('0');
    expect(home.getTabCounter('form')).toEqual('0');

  });

  it('should mark a page as favorite', function() {
    $$('#empty .Artifact-favoriteButton').first().click();
    expect(home.getFavoritePageNames()).toEqual(['Person', 'empty']);

    $$('#empty .Artifact-favoriteButton').first().click();
    expect(home.getFavoritePageNames()).toEqual(['Person']);
  });

  it('should open a migration confirm popup', function() {
    let itemPageToMigrate = $$('#aPageToMigrate a').first();
    itemPageToMigrate.click();

    //The link should now be a visible input with the page name
    let modal = $('#confirm-migrate-popup');
    expect(modal.isPresent()).toBe(true);

    let cancel= $('#cancel-confirm-migrate');
    expect(cancel.isPresent()).toBe(true);
    cancel.click();
    expect(modal.isPresent()).toBe(false);


    itemPageToMigrate.click();
    expect($$('#confirm-migrate').first().isPresent()).toBe(true);
    $('#confirm-migrate').click();
    expect(modal.isPresent()).toBe(false);
    expect(browser.getCurrentUrl()).toMatch(/.*\/pages\/aPageToMigrate/);
  });

  it('should not be clickable when item is not compatible', function() {
    let aPageIncompatible = $$('#aPageIncompatible a.Artifact-disabled').first();
    expect(aPageIncompatible.isPresent()).toBe(true);

    aPageIncompatible.click();
    expect(browser.getCurrentUrl()).toMatch(/.*\/home/);
  });

  it('should list fragments', function() {
    expect(home.getListedFragmentNames()).toEqual(FRAGMENT_NAMES);
  });

  it('should list favorite fragments', function() {
    expect(home.getFavoriteFragmentNames()).toEqual(['personFragment']);
  });

  it('should navigate to a fragment', function() {
    $$('.ArtifactList-fragment a').first().click();

    expect($('.EditorHeader-brand').getText()).toBe('FRAGMENT EDITOR');
  });

  it('should create a fragment', function() {
    home.createFragment('test');
    expect($('.EditorHeader-brand').getText()).toBe('FRAGMENT EDITOR');
  });

  it('should forbid to create a fragment with an already existing name', function() {
    $('.HomeCreate').click();
    element(by.css('#type-fragment')).click();
    $('.modal-body input[name="name"]').sendKeys('Personfragment');
    expect($('.modal-footer button[type="submit"]').isEnabled()).toBeFalsy();
    expect($('.tooltip-inner').getText()).toEqual('This name already exists');
  });

  it('should export a fragment', function() {
    var btn = $$('.ArtifactList-fragment .Artifact-export').first();
    btn.click();
    browser.ignoreSynchronization = true;
    expect($$('.EditorHeader-exportForm').count()).toBe(0);
    browser.ignoreSynchronization = false;
  });

  it('should open a modal to confirm fragment deletion', function() {
    //We want to delete a fragment
    $$('.ArtifactList-fragment .Artifact-delete').first().click();
    //A modal is opened with a confirmation message
    expect($('#confirm-delete-popup .modal-body').getText()).toBe('Are you sure you want to delete the fragment personFragment?');
  });

  it('should rename a fragment', function() {

    var btnRenameFragment = $$('.ArtifactList-fragment .Artifact-rename').first();
    btnRenameFragment.click();

    //The link should now be a visible input with the fragment name
    var nameInput = $('form[name="renameArtifact"] input');
    expect(nameInput.getAttribute('value')).toBe('personFragment');

    // when entering invalid name, we should have a message
    nameInput.sendKeys('Wrong name');
    expect($('form[name="renameArtifact"] .tooltip-inner').isDisplayed()).toBeTruthy();

    //We can change the name
    nameInput.clear();
    nameInput.sendKeys('Person2');

    // It should remove the input
    $('.HomeHeader-title').click();
    expect(nameInput.isPresent()).toBe(false);
    expect($$('.ArtifactList-fragment .Artifact-name').first().getText()).toBe('Person2');
  });

  it('should remove the input to rename a fragment on blur', function() {

    //We want to rename a fragment
    $$('.ArtifactList-fragment .Artifact-rename').first().click();
    //The link should now be a visible input with the fragment name
    var nameFragmentInput = $('form[name="renameArtifact"] input');
    expect(nameFragmentInput.isPresent()).toBe(true);

    browser
      .executeScript('$(\'form[name="renameArtifact"] input\').blur();')
      .then(function() {
        expect(nameFragmentInput.isPresent()).toBe(false);
      });
  });

  it('should set autofocus on the input if we edit a fragment', function() {
    $$('.ArtifactList-fragment .Artifact-rename').first().click();
    var input = $('form[name="renameArtifact"] input');
    expect(input.getAttribute('id')).toEqual(browser.driver.switchTo().activeElement().getAttribute('id'));
  });

  it('should open help popup', function() {
    $('.btn-bonita-help').click();

    expect($('.modal-header .modal-title').getText()).toBe('Help');
  });

  it('should filter widgets, pages and fragment by name', function() {
    home.search('noWidgetNoPagesAndNoFragmentHasANameLikeThat');
    expect(home.getListedFragmentNames()).toEqual([]);
    expect(home.getFavoriteFragmentNames()).toEqual([]);

    home.search('so');   // 'so' is contained by 'PerSOn' and 'aweSOmeWidget'
    expect(home.getListedFragmentNames()).toEqual(['personFragment']);
    expect(home.getFavoriteFragmentNames()).toEqual(['personFragment']);
  });

});
