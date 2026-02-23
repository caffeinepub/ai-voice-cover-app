import Map "mo:core/Map";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
  type OldLyricsRequest = {
    id : Text;
    userId : Text;
    lyrics : Text;
    voiceSampleId : Text;
    status : LyricsStatus;
    generatedCoverId : ?Text;
  };

  type OldActor = {
    lyricsRequests : Map.Map<Text, OldLyricsRequest>;
  };

  type NewLyricsRequest = {
    id : Text;
    userId : Text;
    lyrics : Text;
    voiceSampleId : Text;
    status : LyricsStatus;
    generatedCoverId : ?Text;
    stylePrompt : ?Text;
  };

  type NewActor = {
    lyricsRequests : Map.Map<Text, NewLyricsRequest>;
  };

  type LyricsStatus = {
    #pending;
    #processing;
    #complete;
    #failed : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newLyricsRequests = old.lyricsRequests.map<Text, OldLyricsRequest, NewLyricsRequest>(
      func(_id, oldLyricsRequest) {
        { oldLyricsRequest with stylePrompt = null };
      }
    );
    { lyricsRequests = newLyricsRequests };
  };
};
