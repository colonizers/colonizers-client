'use strict';

var $ = require('jquery'),
    template = require('./build-modal.html'),
    observableProps = require('./../game/observable-properties');

function BuildModalModel(roomModel) {

  this.buildCity = this.buildCity.bind(this);
  this.buildSettlement = this.buildSettlement.bind(this);
  this.buildRoad = this.buildRoad.bind(this);
  this.resetCanBuildProps = this.resetCanBuildProps.bind(this);

  this.roomModel = roomModel;

  observableProps.defineProperties(this, {
    allowanceRoads: 0,
    allowanceSettlements: 0,
    allowanceCities: 0,
    canBuildRoad: false,
    canBuildSettlement: false,
    canBuildCity: false
  });

  var resetAllowances = this.resetAllowances.bind(this);
  roomModel.subscribe('thisPlayer', resetAllowances);
  roomModel.subscribe('game', resetAllowances);

  roomModel.emitterQueue.on('Build', this.onBuild.bind(this));
}

BuildModalModel.prototype.resetAllowances = function() {
  var thisPlayer = this.roomModel.thisPlayer,
      player = thisPlayer ? thisPlayer.player : null,
      game = this.roomModel.game,
      edges,
      corners;

  this.allowanceRoads = 0;
  this.allowanceSettlements = 0;
  this.allowanceCities = 0;

  if (player && game && game.allowance) {
    edges = game.board.edges.query({
      owner: player
    });

    corners = game.board.corners.query({
      owner: player
    });

    this.allowanceRoads = game.allowance.roads - edges.length;
    this.allowanceSettlements = game.allowance.settlements - corners.length;
    this.allowanceCities = game.allowance.cities;
  }

  this.resetCanBuildProps();
};

BuildModalModel.prototype.resetCanBuildProps = function() {
  var thisPlayer = this.roomModel.thisPlayer,
      player = thisPlayer ? thisPlayer.player : null,
      game = this.roomModel.game,
      edges,
      corners,
      roads,
      settlements;

  this.canBuildRoad = false;
  this.canBuildSettlement = false;
  this.canBuildCity = false;

  if (game && player && player.hasResources) {

    edges = game.getBuildableEdgesForPlayer(player);
    corners = game.getBuildableCornersForPlayer(player);

    roads = this.allowanceRoads > 0 &&
            edges.length > 0 &&
            player.hasResources({
              lumber: 1,
              brick: 1
            });

    this.canBuildRoad = roads;

    settlements = this.allowanceSettlements > 0 &&
                  corners.length > 0 &&
                  player.hasResources({
                    lumber: 1,
                    brick: 1,
                    wool: 1,
                    grain: 1
                  });

    this.canBuildSettlement = settlements;

    this.canBuildCity = false;
  }
};

BuildModalModel.prototype.onBuild = function(data, next) {
  var thisPlayer = this.roomModel.thisPlayer;

  if (thisPlayer) {
    if (thisPlayer.id === data.playerId) {
      if (data.buildType === 'edge') {
        this.allowanceRoads = this.allowanceRoads - 1;
      }
      if (data.buildType === 'corner') {
        this.allowanceSettlements = this.allowanceSettlements - 1;
      }
    }
  }
  this.resetCanBuildProps();
  next();
};

BuildModalModel.prototype.buildRoad = function() {
  $('#buildModal').modal('hide');
  this.roomModel.game.showBuildableEdges();
};

BuildModalModel.prototype.buildSettlement = function() {
  $('#buildModal').modal('hide');
  this.roomModel.game.showBuildableSettlements();
};

BuildModalModel.prototype.buildCity = function() {

};

module.exports = {
  viewModel: BuildModalModel,
  template: template
};
