import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  module Prediction {
    public type Timestamp = Int;
    public type FeasibilityStatus = {
      #excellent;
      #good;
      #moderate;
      #poor;
    };

    public type Record = {
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
      feasibilityStatus : FeasibilityStatus;
      timestamp : Timestamp;
    };

    public func compareByTimestamp(a : Record, b : Record) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let predictions = Map.empty<Text, Prediction.Record>();

  public type CreatePredictionRequest = {
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
    feasibilityStatus : Prediction.FeasibilityStatus;
  };

  public shared ({ caller }) func addPrediction(request : CreatePredictionRequest) : async () {
    let id = Time.now().toText() # caller.toText();
    let record : Prediction.Record = {
      id;
      locationName = request.locationName;
      latitude = request.latitude;
      longitude = request.longitude;
      solarCapacity = request.solarCapacity;
      temperature = request.temperature;
      humidity = request.humidity;
      cloudCover = request.cloudCover;
      precipitation = request.precipitation;
      shortwaveRadiation = request.shortwaveRadiation;
      zenithAngle = request.zenithAngle;
      azimuthAngle = request.azimuthAngle;
      predictedDailyOutput = request.predictedDailyOutput;
      predictedWeeklyOutput = request.predictedWeeklyOutput;
      predictedMonthlyOutput = request.predictedMonthlyOutput;
      predictedYearlyOutput = request.predictedYearlyOutput;
      feasibilityStatus = request.feasibilityStatus;
      timestamp = Time.now();
    };
    predictions.add(id, record);
  };

  public query ({ caller }) func getAllPredictions() : async [Prediction.Record] {
    predictions.values().toArray().sort(Prediction.compareByTimestamp);
  };

  public shared ({ caller }) func deletePrediction(id : Text) : async () {
    if (not predictions.containsKey(id)) {
      Runtime.trap("Prediction record does not exist");
    };
    predictions.remove(id);
  };

  public shared ({ caller }) func clearAllPredictions() : async () {
    predictions.clear();
  };
};
