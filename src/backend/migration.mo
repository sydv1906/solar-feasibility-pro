import Map "mo:core/Map";
import Int "mo:core/Int";

module {
  type OldRecord = {
    id : Text;
    locationName : Text;
    latitude : Float;
    longitude : Float;
    temperature : Float;
    irradiance : Float;
    humidity : Float;
    powerOutput : Float;
    feasibilityStatus : {
      #veryHigh;
      #high;
      #medium;
      #low;
      #veryLow;
    };
    feasibilityScore : Float;
    confidenceScore : Float;
    timestamp : Int;
  };

  type OldActor = {
    predictions : Map.Map<Text, OldRecord>;
  };

  type NewRecord = {
    id : Text;
    locationName : Text;
    latitude : Float;
    longitude : Float;
    solarCapacity : Float;
    temperature : Float;
    humidity : Float;
    cloudCover : Float;
    precipitation : Float;
    shortwaveRadiation : Float;
    zenithAngle : Float;
    azimuthAngle : Float;
    predictedDailyOutput : Float;
    predictedWeeklyOutput : Float;
    predictedMonthlyOutput : Float;
    predictedYearlyOutput : Float;
    feasibilityStatus : {
      #excellent;
      #good;
      #moderate;
      #poor;
    };
    timestamp : Int;
  };

  type NewActor = {
    predictions : Map.Map<Text, NewRecord>;
  };

  public func run(old : OldActor) : NewActor {
    let newPredictions = old.predictions.map<Text, OldRecord, NewRecord>(
      func(_id, oldRecord) {
        {
          oldRecord with
          solarCapacity = oldRecord.powerOutput;
          cloudCover = 0.0;
          precipitation = 0.0;
          shortwaveRadiation = oldRecord.irradiance;
          zenithAngle = 0.0;
          azimuthAngle = 0.0;
          predictedDailyOutput = oldRecord.powerOutput;
          predictedWeeklyOutput = oldRecord.powerOutput * 7.0;
          predictedMonthlyOutput = oldRecord.powerOutput * 30.0;
          predictedYearlyOutput = oldRecord.powerOutput * 365.0;
          feasibilityStatus = convertFeasibilityStatus(oldRecord.feasibilityStatus);
        };
      }
    );
    { predictions = newPredictions };
  };

  func convertFeasibilityStatus(oldStatus : { #veryHigh; #high; #medium; #low; #veryLow }) : { #excellent; #good; #moderate; #poor } {
    switch (oldStatus) {
      case (#veryHigh) { #excellent };
      case (#high) { #good };
      case (#medium) { #moderate };
      case (#low) { #poor };
      case (#veryLow) { #poor };
    };
  };
};
