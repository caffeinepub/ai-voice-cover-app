import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import Migration "migration";
import List "mo:core/List";
import Debug "mo:core/Debug";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Persistent storage
  let songs = Map.empty<Text, Song>();
  let voiceSamples = Map.empty<Text, VoiceSample>();
  let voicePersonas = Map.empty<Text, VoicePersona>();
  let covers = Map.empty<Text, Cover>();
  let lyricsRequests = Map.empty<Text, LyricsRequest>();

  // Data types
  type Song = {
    id : Text;
    title : Text;
    artist : Text;
    audioFile : Storage.ExternalBlob;
    instrumentalFile : Storage.ExternalBlob;
    creationDate : Int;
    modeType : ModeType;
    voiceSampleId : ?Text;
  };

  type ModeType = {
    #cover;
    #original;
  };

  type VoiceSample = {
    id : Text;
    userId : Text;
    voiceFile : Storage.ExternalBlob;
  };

  type VoicePersona = {
    id : Text;
    userId : Text;
    name : Text;
    voiceSampleId : Text;
  };

  type Cover = {
    id : Text;
    originalSong : Song;
    userVoice : VoiceSample;
    finalMix : Storage.ExternalBlob;
  };

  type LyricsRequest = {
    id : Text;
    userId : Text;
    lyrics : Text;
    voiceSampleId : Text;
    status : LyricsStatus;
    generatedCoverId : ?Text;
    stylePrompt : ?Text;
  };

  type LyricsStatus = {
    #pending;
    #processing;
    #complete;
    #failed : Text;
  };

  // Add a song with audio and instrumental files
  public shared ({ caller }) func uploadSong(id : Text, title : Text, artist : Text, audioFile : Storage.ExternalBlob, instrumentalFile : Storage.ExternalBlob, voiceSampleId : ?Text, modeType : ModeType) : async () {
    let song : Song = {
      id;
      title;
      artist;
      audioFile;
      instrumentalFile;
      creationDate = Time.now();
      voiceSampleId;
      modeType;
    };
    songs.add(id, song);
  };

  // Add a voice sample for a user
  public shared ({ caller }) func uploadVoiceSample(id : Text, userId : Text, voiceFile : Storage.ExternalBlob) : async () {
    let sample : VoiceSample = {
      id;
      userId;
      voiceFile;
    };
    voiceSamples.add(id, sample);
  };

  // Create a voice persona
  public shared ({ caller }) func createVoicePersona(id : Text, userId : Text, name : Text, voiceSampleId : Text) : async () {
    let persona : VoicePersona = {
      id;
      userId;
      name;
      voiceSampleId;
    };
    voicePersonas.add(id, persona);
  };

  // Create a cover by combining a song and a voice sample
  public shared ({ caller }) func createCover(coverId : Text, songId : Text, voiceSampleId : Text, finalMix : Storage.ExternalBlob) : async () {
    let song = switch (songs.get(songId)) {
      case (null) { return };
      case (?song) { song };
    };

    let voice = switch (voiceSamples.get(voiceSampleId)) {
      case (null) { return };
      case (?voice) { voice };
    };

    let cover : Cover = {
      id = coverId;
      originalSong = song;
      userVoice = voice;
      finalMix;
    };
    covers.add(coverId, cover);

    let userSong : Song = {
      id = coverId;
      title = song.title;
      artist = song.artist;
      audioFile = finalMix;
      instrumentalFile = song.instrumentalFile;
      creationDate = Time.now();
      modeType = #cover;
      voiceSampleId = ?voiceSampleId;
    };
    songs.add(coverId, userSong);
  };

  // Get a cover by ID
  public query ({ caller }) func getCover(id : Text) : async ?Cover {
    covers.get(id);
  };

  // Request lyrics-based song generation
  public shared ({ caller }) func submitLyricsRequest(requestId : Text, userId : Text, lyrics : Text, voiceSampleId : Text, finalMix : Storage.ExternalBlob, stylePrompt : ?Text) : async () {
    let request : LyricsRequest = {
      id = requestId;
      userId;
      lyrics;
      voiceSampleId;
      status = #pending;
      generatedCoverId = null;
      stylePrompt;
    };
    lyricsRequests.add(requestId, request);

    let generatedSong : Song = {
      id = requestId;
      title = lyrics;
      artist = userId;
      audioFile = finalMix;
      instrumentalFile = finalMix;
      creationDate = Time.now();
      modeType = #original;
      voiceSampleId = ?voiceSampleId;
    };
    songs.add(requestId, generatedSong);
  };

  public query ({ caller }) func getLyricsRequest(requestId : Text) : async ?LyricsRequest {
    lyricsRequests.get(requestId);
  };

  public query ({ caller }) func getAllLyricsRequests() : async [LyricsRequest] {
    lyricsRequests.values().toArray();
  };

  public query ({ caller }) func getUserLibrary(userId : Text) : async [Song] {
    let filteredSongs = List.empty<Song>();
    for (song in songs.values()) {
      switch (song.voiceSampleId) {
        case (?id) {
          if (id == userId) {
            filteredSongs.add(song);
          };
        };
        case (null) {};
      };
    };
    filteredSongs.toArray();
  };

  public query ({ caller }) func getAllVoicePersonas(userId : Text) : async [VoicePersona] {
    let filteredPersonas = List.empty<VoicePersona>();
    for (persona in voicePersonas.values()) {
      if (persona.userId == userId) {
        filteredPersonas.add(persona);
      };
    };
    filteredPersonas.toArray();
  };
};
