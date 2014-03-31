function gotoHookSetup() {
  event.preventDefault();
  var repo = $('#repoName').val();
  if (!repo) { return; }
  window.open('http://github.com/' + repo + '/settings/hooks/new', '_blank');
}
