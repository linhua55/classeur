angular.module('classeur.extensions.fileDragging', [])
	.directive('clFileDraggingSrc', function(clFileDraggingSvc) {
		var Hammer = window.Hammer;
		return {
			restrict: 'A',
			link: function(scope, element) {
				function movePanel(evt) {
					evt.preventDefault();
					clFileDraggingSvc.panel.move().to(evt.center.x + 10, evt.center.y).end();
				}
				var hammertime = new Hammer(element[0].querySelector('.drag'));
				hammertime.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 0});
				hammertime.on('panstart', function(evt) {
					if(clFileDraggingSvc.targetFolder) {
						clFileDraggingSvc.targetFolder.isDraggingTarget = false;
						clFileDraggingSvc.targetFolder = undefined;
					}
					clFileDraggingSvc.setFileSrc(scope.fileDao);
					movePanel(evt);
					scope.$apply();
				});
				hammertime.on('panmove', function(evt) {
					movePanel(evt);
				});
				hammertime.on('panend', function() {
					clFileDraggingSvc.moveFiles();
					clFileDraggingSvc.files = [];
					scope.$apply();
				});
			}
		};
	})
	.directive('clFileDraggingTarget', function(clFileDraggingSvc, clClasseurLayoutSvc) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				if(scope.folderDao === clClasseurLayoutSvc.createFolder) {
					return;
				}
				element.on('mouseenter', function() {
					if(clFileDraggingSvc.files.length) {
						scope.folderDao.isDraggingTarget = true;
						clFileDraggingSvc.targetFolder = scope.folderDao;
						scope.$apply();
					}
				});
				element.on('mouseleave', function() {
					if(clFileDraggingSvc.targetFolder === scope.folderDao) {
						scope.folderDao.isDraggingTarget = false;
						clFileDraggingSvc.targetFolder = undefined;
						scope.$apply();
					}
				});
			}
		};
	})
	.directive('clFileDragging', function(clFileDraggingSvc, clPanel) {
		return {
			restrict: 'E',
			templateUrl: 'app/extensions/fileDragging/fileDragging.html',
			link: function(scope, element) {
				scope.fileDraggingSvc = clFileDraggingSvc;
				clFileDraggingSvc.panel = clPanel(element, '.panel');
			}
		};
	})
	.factory('clFileDraggingSvc', function(clClasseurLayoutSvc) {
		function setFileSrc(fileDao) {
			clFileDraggingSvc.files = fileDao.isSelected ? clClasseurLayoutSvc.files.filter(function(fileDao) {
				return fileDao.isSelected;
			}) : [fileDao];
		}

		function moveFiles() {
			if(clFileDraggingSvc.targetFolder && clFileDraggingSvc.targetFolder !== clClasseurLayoutSvc.currentFolder) {
				clFileDraggingSvc.files.forEach(function(fileDao) {
					fileDao.folderId = clFileDraggingSvc.targetFolder.id;
				});
				clClasseurLayoutSvc.refreshFiles();
			}
		}

		var clFileDraggingSvc = {
			files: [],
			setFileSrc: setFileSrc,
			moveFiles: moveFiles
		};
		return clFileDraggingSvc;
	});