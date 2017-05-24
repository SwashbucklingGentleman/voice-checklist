// Everything is currently here.
// It should be broken up in to sensible components.
// Dependencies:
//  -Vue
//  -Vue Resource
//  -annyang!
// Initiate the view app
// Get the list item data
// Set up the voice commands with annyang!
// Define methods for controlling the Vue app
// and modifying the local data.
(function(){
  var app = new Vue({
    el: "#app",
    data: {
      // The index of the current area in the listdata
      currentAreaIndex: 0,
      // The index of the current list item in the
      // current area's list of items.
      currentListItemIndex: 0,
      // The the areas and their items.
      // It be like:
      //[
      //  {
      //    groupName: 'Firelink Shrine',
      //    listItems: [
      //      {
      //        text: "Kill Cresfallen Warrior",
      //        isFinished: true
      //      }
      //      ...
      //    ]
      //  }
      //  ...
      //]
      listdata: null,
      // The currently visible view
      // Views: currentListItem, allListItems, allAreas
      currentView: "none",
      dataVersion: "v1"
    },
    beforeMount: function() {
      // Get that data.
      this.getListData();
      // Bind word commands to actions
      var commands = {
        "move last": this.moveToPreviousListItem,
        "move next": this.moveToNextListItem,
        "got it": this.markCurrentItemAsFinished,
        "unfinished": this.markCurrentItemAsUnfinished,
        "next area": this.moveToNextArea,
        "last area": this.moveToPreviousArea,
        "all areas": this.showAllAreas,
        "current item": this.showCurrentListItem,
        "go to area :number": this.goToArea,
        "go to item :number": this.goToItem,
        "all items": this.showAllListItems,
      };

      // Add our commands to annyang
      annyang.addCommands(commands);
      annyang.start();

    },
    methods: {
      // Get the json data of the areas and items
      // and store it.
      getListData: function(){
        var listDataJSONString = localStorage[this.getDataPropertyName()];
        var loadedData = null;
        if (listDataJSONString){
          // Try to get saved data from local storage.
          // Eventually we'll need to do conversions between versions,
          // when the schema changes.
          loadedData = JSON.parse(listDataJSONString);
        } 
        if (!loadedData) {
          // No saved data found, get data loaded from the server.
          // Currently the data will be attached to the window as
          // a js object by a loaded js file to avoid having to get it from a web server.
          loadedData = window.listData[this.dataVersion];
          delete window.listData;
        }
        if (!loadedData) {
          // No data found. We can't do anything.
          console.error("Error: no data found.");
        }
        this.listdata = loadedData;
        this.currentView = "currentListItem";
      },
      // Save the current state of the list to local storage.
      saveListData: function() {
        localStorage[this.getDataPropertyName()] = JSON.stringify(this.listdata);
      },
      getDataPropertyName: function() {
        return "listData" + this.dataVersion;
      },
      // Set the isFinished property of the current
      // list item to true, and go to the next item.
      markCurrentItemAsFinished: function(){
        Vue.set(this.currentListItem, "isFinished", true);
        this.moveToNextListItem();
        this.saveListData();
      },
      // Set the isFinished property of the current
      // list item to true, and stay on it.
      markCurrentItemAsUnfinished: function(){
        Vue.set(this.currentListItem, "isFinished", false);
        this.saveListData();
      },
      // Go to the next item. If the current item is the last item in the area
      // in the area, go to the first item of the next area.
      // TODO: Show a message when you try to go past the end.
      moveToNextListItem: function(){
        if (this.currentListItemIndex < this.currentArea.listItems.length - 1){
          this.currentListItemIndex++;
        }
        else if (this.currentAreaIndex < this.listdata.length - 1) {
          this.moveToNextArea();
          this.currentListItemIndex = 0;
        }
      },
      // Go to the next item. If the current item is the last item in the area
      // in the area, go to the first item of the next area.
      // TODO: Show a message when you try to go past the beginning.
      moveToPreviousListItem: function(){
        if (this.currentListItemIndex !== 0)
        {
          this.currentListItemIndex--;
        }
        else if (this.currentAreaIndex !== 0){
            this.moveToPreviousArea();
            this.currentListItemIndex = this.listdata[this.currentAreaIndex].listItems.length - 1;
        }
      },
      // Move make the next area the current area.
      // TODO: Boundry handling.
      moveToNextArea: function(){
        this.currentAreaIndex++;
        this.currentListItemIndex = 0;
      },
      // Move make the previous area the current area.
      // TODO: Boundry handling.
      moveToPreviousArea: function(){
        this.currentAreaIndex--;
        this.currentListItemIndex = 0;
      },
      // Switch to the all areas view with the items collapsed
      showAllAreas: function(){
        this.currentView = "allAreas";
      },
      // Switch to the current list item
      // view witch only show the current list item.
      showCurrentListItem: function(){
        this.currentView = "currentListItem";
      },
      // Switch to the all items view, which shows
      // all the items for the current area.
      showAllListItems: function(){
        this.currentView = "allListItems";
      },
      // Go to the specified area number.
      // TODO: Handle the case when the area doesn't exist.
      goToArea: function(number){
        this.currentAreaIndex = number - 1;
        this.currentView = "currentListItem";
      },
      // Go to the specified item number in the current area.
      // TODO: Handle the case when the item doesn't exist.
      goToItem: function(number){
        this.currentListItemIndex = number - 1;
      },
    },
    computed: {
      // Get the current area object.
      currentArea: function() {
        return this.listdata[this.currentAreaIndex];
      },
      // Get the current list item object.
      currentListItem: function () {
        return this.listdata[this.currentAreaIndex].listItems[this.currentListItemIndex];
      },
      // Get the number of items which have been marked
      // as finished.
      completedItemsForCurrentArea: function() {
        var finished = 0;
        this.listdata[this.currentAreaIndex].listItems.forEach(function(item){
          if (item.isFinished)
            finished += 1;
        });

        return finished;
      }
    }
  });

})();
