"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import L from "leaflet";

type MapFocus = "all" | "user" | "parcel";
type MapOverlay = "points" | "heatmap";

type CapturePoint = {
  id: string;
  lat: number;
  lng: number;
};

type MapPolygon = {
  id: string;
  name: string;
  positions: LatLngTuple[];
};

type TravailLiveMapProps = {
  focus: MapFocus;
  overlay: MapOverlay;
};

const selectedParcelName = "12125";

const kmlParcels: MapPolygon[] = [
  { id: "12125-1", name: "12125", positions: [[36.99277742, -120.45550533], [36.98905, -120.45553095], [36.98900189, -120.44707328], [36.98920842, -120.44691374], [36.98947548, -120.44680115], [36.98955517, -120.4464926], [36.98999093, -120.44649927], [36.99275328, -120.44648951], [36.99277742, -120.45550533]] },
  { id: "102123-2", name: "102123", positions: [[36.98540071, -120.45554662], [36.98176138, -120.45558294], [36.98174906, -120.4464679], [36.98539545, -120.44644958], [36.98540071, -120.45554662]] },
  { id: "102102-3", name: "102102", positions: [[36.98538778, -120.43735454], [36.98172796, -120.43733815], [36.98171235, -120.42822042], [36.98536467, -120.42824252], [36.98538778, -120.43735454]] },
  { id: "untitled-polygon-4", name: "Untitled polygon", positions: [[36.99277803, -120.45550644], [36.99532386, -120.45549081], [36.99531444, -120.45967661], [36.99278221, -120.45971245], [36.99277803, -120.45550644]] },
  { id: "untitled-polygon-5", name: "Untitled polygon", positions: [[36.98909311, -120.45972861], [36.98906989, -120.45763336], [36.98905085, -120.45553148], [36.9927776, -120.45550703], [36.99277164, -120.45971567], [36.98909311, -120.45972861]] },
  { id: "untitled-polygon-6", name: "Untitled polygon", positions: [[36.989092, -120.45972798], [36.98740428, -120.45974714], [36.98541902, -120.45975269], [36.98540441, -120.45554761], [36.98667076, -120.45554182], [36.98904943, -120.45553138], [36.989092, -120.45972798]] },
  { id: "untitled-polygon-7", name: "Untitled polygon", positions: [[36.98176674, -120.45977344], [36.98176217, -120.45557984], [36.98540258, -120.45554871], [36.98541537, -120.45975837], [36.98176674, -120.45977344]] },
  { id: "untitled-polygon-8", name: "Untitled polygon", positions: [[36.98176125, -120.45977423], [36.97993154, -120.45978254], [36.97947532, -120.45939488], [36.97871372, -120.45879692], [36.97836321, -120.45851586], [36.97808169, -120.45827498], [36.97808054, -120.45559136], [36.9817607, -120.45558148], [36.98176125, -120.45977423]] },
  { id: "untitled-polygon-9", name: "Untitled polygon", positions: [[36.97497678, -120.4556399], [36.97534075, -120.45560455], [36.97573683, -120.45561092], [36.97651112, -120.45560214], [36.97727983, -120.45559983], [36.97767282, -120.45559407], [36.97790252, -120.45559822], [36.97807767, -120.45559179], [36.97806761, -120.45626636], [36.97806205, -120.45691822], [36.9780704, -120.4575855], [36.97807289, -120.45791804], [36.9780602, -120.4582455], [36.97793699, -120.45815179], [36.97774691, -120.45800097], [36.97732389, -120.45764052], [36.97651976, -120.45696018], [36.97575751, -120.4563084], [36.97536205, -120.45598673], [36.97514568, -120.45581443], [36.97497678, -120.4556399]] },
  { id: "untitled-polygon-10", name: "Untitled polygon", positions: [[36.97194424, -120.45304161], [36.97183604, -120.45284299], [36.97172018, -120.45244811], [36.97160139, -120.45055195], [36.9714616, -120.4482246], [36.97137233, -120.44653609], [36.97444357, -120.44651362], [36.97446745, -120.4552253], [36.973725, -120.45458595], [36.97295866, -120.45398269], [36.97276953, -120.45379983], [36.97256332, -120.45365006], [36.97240269, -120.45347658], [36.97224648, -120.45335346], [36.97207135, -120.45321439], [36.97194424, -120.45304161]] },
  { id: "untitled-polygon-11", name: "Untitled polygon", positions: [[36.98541029, -120.44645401], [36.98795822, -120.44643414], [36.98795111, -120.447026], [36.98806447, -120.44704225], [36.98898986, -120.44703753], [36.98904919, -120.45553085], [36.98683142, -120.45554109], [36.98668019, -120.45554342], [36.98540351, -120.45554677], [36.98541029, -120.44645401]] },
  { id: "untitled-polygon-12", name: "Untitled polygon", positions: [[36.97447209, -120.45522692], [36.97444255, -120.4465137], [36.9780565, -120.44649147], [36.97807893, -120.45558891], [36.97494292, -120.45563196], [36.97447209, -120.45522692]] },
  { id: "untitled-polygon-13", name: "Untitled polygon", positions: [[36.9780569, -120.44649143], [36.98174746, -120.44646615], [36.98175924, -120.45558266], [36.97807987, -120.45558883], [36.9780569, -120.44649143]] },
  { id: "untitled-polygon-14", name: "Untitled polygon", positions: [[36.97444458, -120.4465114], [36.97445099, -120.44100354], [36.97804853, -120.44105186], [36.9780554, -120.44648984], [36.97444458, -120.4465114]] },
  { id: "untitled-polygon-15", name: "Untitled polygon", positions: [[36.9780489, -120.44105159], [36.98173321, -120.44109609], [36.98174702, -120.4464646], [36.97805571, -120.44649115], [36.9780489, -120.44105159]] },
  { id: "untitled-polygon-16", name: "Untitled polygon", positions: [[36.98531129, -120.41914888], [36.98166379, -120.41912067], [36.9816095, -120.41020511], [36.98526032, -120.41022791], [36.98531129, -120.41914888]] },
  { id: "untitled-polygon-17", name: "Untitled polygon", positions: [[36.98526236, -120.41022993], [36.98567155, -120.410246], [36.98892081, -120.4103072], [36.98896339, -120.41921245], [36.9853097, -120.41914949], [36.98526236, -120.41022993]] },
  { id: "untitled-polygon-18", name: "Untitled polygon", positions: [[36.9926759, -120.41925191], [36.99081824, -120.41923988], [36.988966, -120.41921136], [36.98892166, -120.41030699], [36.99262564, -120.41037167], [36.9926759, -120.41925191]] },
  { id: "untitled-polygon-19", name: "Untitled polygon", positions: [[36.99267523, -120.41916205], [36.99262915, -120.41037352], [36.99314003, -120.41035963], [36.99343117, -120.41065643], [36.99365008, -120.41092058], [36.99449947, -120.41184789], [36.99477781, -120.41263977], [36.99280185, -120.41917686], [36.99273965, -120.41916383], [36.99267523, -120.41916205]] },
  { id: "untitled-polygon-20", name: "Untitled polygon", positions: [[36.9921327, -120.42144739], [36.99211138, -120.42176481], [36.99209527, -120.42208244], [36.99235657, -120.42346188], [36.99253706, -120.42423515], [36.9926926, -120.42499137], [36.99271557, -120.42828607], [36.98901658, -120.42827695], [36.98896821, -120.41921359], [36.992089, -120.41925615], [36.99278112, -120.41925524], [36.99246811, -120.42035868], [36.99230182, -120.42091134], [36.9921327, -120.42144739]] },
  { id: "untitled-polygon-21", name: "Untitled polygon", positions: [[36.98901582, -120.42827667], [36.98536684, -120.42824002], [36.98534428, -120.42407765], [36.98530909, -120.41915031], [36.98896678, -120.41921429], [36.98901582, -120.42827667]] },
  { id: "untitled-polygon-22", name: "Untitled polygon", positions: [[36.98171221, -120.42821972], [36.98166674, -120.4191202], [36.985309, -120.41914874], [36.9853665, -120.42824099], [36.98171221, -120.42821972]] },
  { id: "untitled-polygon-23", name: "Untitled polygon", positions: [[36.97802844, -120.42821393], [36.97801501, -120.42455972], [36.98112182, -120.42542802], [36.98136164, -120.42558432], [36.98170212, -120.42577437], [36.98171187, -120.42821964], [36.97802844, -120.42821393]] },
  { id: "untitled-polygon-24", name: "Untitled polygon", positions: [[36.98172754, -120.43733821], [36.97804531, -120.43731954], [36.97802871, -120.42821391], [36.98171206, -120.42822009], [36.98172754, -120.43733821]] },
  { id: "untitled-polygon-25", name: "Untitled polygon", positions: [[36.97441281, -120.4281937], [36.97438492, -120.42357137], [36.97569367, -120.42393945], [36.97801432, -120.42455966], [36.97802836, -120.42821385], [36.97441281, -120.4281937]] },
  { id: "untitled-polygon-26", name: "Untitled polygon", positions: [[36.97027779, -120.42818967], [36.96992114, -120.42237822], [36.97344378, -120.42330351], [36.97436222, -120.42355772], [36.97441237, -120.42819364], [36.97027779, -120.42818967]] },
  { id: "untitled-polygon-27", name: "Untitled polygon", positions: [[36.97085542, -120.437289], [36.97027632, -120.42817806], [36.974412, -120.42819339], [36.97444131, -120.43729868], [36.97085542, -120.437289]] },
  { id: "untitled-polygon-28", name: "Untitled polygon", positions: [[36.97804502, -120.43731945], [36.97444117, -120.43729871], [36.97441285, -120.42819326], [36.97802817, -120.42821402], [36.97804502, -120.43731945]] },
  { id: "untitled-polygon-29", name: "Untitled polygon", positions: [[36.9710533, -120.44098497], [36.97096145, -120.43976434], [36.97088639, -120.43849428], [36.97088497, -120.43805795], [36.97085608, -120.43728926], [36.97444141, -120.43729879], [36.97445063, -120.44100338], [36.9710533, -120.44098497]] },
  { id: "untitled-polygon-30", name: "Untitled polygon", positions: [[36.97105661, -120.44098883], [36.97445086, -120.44100368], [36.97445307, -120.44386195], [36.97444292, -120.44651313], [36.97139044, -120.44652349], [36.97117771, -120.44325216], [36.97109966, -120.44226707], [36.97105661, -120.44098883]] },
  { id: "untitled-polygon-31", name: "Untitled polygon", positions: [[36.97804501, -120.43731945], [36.98173403, -120.4373363], [36.98173636, -120.44109422], [36.97804893, -120.44105138], [36.97804501, -120.43731945]] },
  { id: "untitled-polygon-32", name: "Untitled polygon", positions: [[36.98174055, -120.44110581], [36.98173279, -120.43733656], [36.9853867, -120.43735571], [36.98539882, -120.44115475], [36.98174055, -120.44110581]] },
  { id: "untitled-polygon-33", name: "Untitled polygon", positions: [[36.98536626, -120.4282413], [36.98901702, -120.42827639], [36.98902366, -120.43363999], [36.98903402, -120.43737139], [36.98538858, -120.43735576], [36.98536626, -120.4282413]] },
  { id: "untitled-polygon-34", name: "Untitled polygon", positions: [[36.98901651, -120.42827696], [36.99271615, -120.4282875], [36.99273384, -120.43283171], [36.99274263, -120.43511059], [36.99273188, -120.43739295], [36.98903481, -120.43737849], [36.98901651, -120.42827696]] },
  { id: "untitled-polygon-35", name: "Untitled polygon", positions: [[36.99433719, -120.43261984], [36.99415738, -120.43267055], [36.99413389, -120.43294209], [36.99440937, -120.43296767], [36.99535296, -120.43741131], [36.99273654, -120.43739929], [36.99271784, -120.42829122], [36.99269694, -120.42577305], [36.99276134, -120.42575775], [36.99284288, -120.4257815], [36.99433719, -120.43261984]] },
  { id: "untitled-polygon-36", name: "Untitled polygon", positions: [[36.99275852, -120.44649217], [36.99273592, -120.44132963], [36.99536746, -120.44134689], [36.99540832, -120.44643502], [36.99275852, -120.44649217]] },
  { id: "untitled-polygon-37", name: "Untitled polygon", positions: [[36.99273746, -120.44132845], [36.99273491, -120.4373973], [36.99535281, -120.43741327], [36.9953793, -120.43838276], [36.9953753, -120.43935929], [36.995369, -120.44133919], [36.99273746, -120.44132845]] },
  { id: "untitled-polygon-38", name: "Untitled polygon", positions: [[36.98903448, -120.43737747], [36.99273448, -120.43739609], [36.99273168, -120.44126636], [36.98902721, -120.44122772], [36.98903448, -120.43737747]] },
  { id: "untitled-polygon-39", name: "Untitled polygon", positions: [[36.974451, -120.44100349], [36.97444126, -120.43729876], [36.97804503, -120.43731935], [36.97804899, -120.44105109], [36.974451, -120.44100349]] },
  { id: "untitled-polygon-40", name: "Untitled polygon", positions: [[36.98903196, -120.43737208], [36.98902363, -120.44099462], [36.98876837, -120.44098791], [36.9886947, -120.44113093], [36.98675148, -120.44111668], [36.98539952, -120.44115344], [36.98538833, -120.43735582], [36.98903196, -120.43737208]] },
  { id: "untitled-polygon-41", name: "Untitled polygon", positions: [[36.99275842, -120.44648851], [36.99011758, -120.44649711], [36.98952334, -120.44642973], [36.98951193, -120.44633751], [36.98953477, -120.44553128], [36.98905876, -120.44550123], [36.98902259, -120.44174975], [36.98954822, -120.44166738], [36.98961679, -120.4412587], [36.99273127, -120.44126729], [36.99275842, -120.44648851]] },
  { id: "untitled-polygon-42", name: "Untitled polygon", positions: [[36.98901161, -120.44541887], [36.98858625, -120.44544944], [36.98857262, -120.44624344], [36.98798767, -120.44629076], [36.98788425, -120.44642533], [36.98544395, -120.44644463], [36.98540044, -120.44115459], [36.98902177, -120.44118489], [36.98901404, -120.4452111], [36.98901161, -120.44541887]] },
  { id: "untitled-polygon-43", name: "Untitled polygon", positions: [[36.98540091, -120.44115381], [36.9853753, -120.446449], [36.9817485, -120.44646664], [36.98173742, -120.44109839], [36.98540091, -120.44115381]] },
  { id: "untitled-polygon-44", name: "Untitled polygon", positions: [[36.99277912, -120.45550887], [36.99275698, -120.44649476], [36.99538656, -120.44647078], [36.99532186, -120.45549151], [36.99277912, -120.45550887]] },
];

const selectedParcel = kmlParcels.find((parcel) => parcel.name === selectedParcelName) ?? kmlParcels[0];
const parcelCenter: LatLngTuple = [36.9909, -120.4511];

const userIcon = L.divIcon({
  className: "travail-live-map-user-icon",
  html: '<span class="travail-live-map-user-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function getPolygonBounds(polygons: MapPolygon[]) {
  return L.latLngBounds(polygons.flatMap((polygon) => polygon.positions));
}

const capturePoints: CapturePoint[] = [
  { id: "cap-1", lat: 36.99222, lng: -120.45445 },
  { id: "cap-2", lat: 36.99212, lng: -120.45335 },
  { id: "cap-3", lat: 36.99198, lng: -120.4522 },
  { id: "cap-4", lat: 36.99182, lng: -120.45105 },
  { id: "cap-5", lat: 36.99158, lng: -120.45485 },
  { id: "cap-6", lat: 36.99144, lng: -120.45365 },
  { id: "cap-7", lat: 36.9913, lng: -120.45245 },
  { id: "cap-8", lat: 36.99116, lng: -120.45125 },
  { id: "cap-9", lat: 36.99092, lng: -120.45425 },
  { id: "cap-10", lat: 36.99078, lng: -120.45305 },
  { id: "cap-11", lat: 36.99064, lng: -120.45185 },
  { id: "cap-12", lat: 36.9905, lng: -120.45065 },
  { id: "cap-13", lat: 36.9902, lng: -120.45495 },
  { id: "cap-14", lat: 36.99008, lng: -120.45375 },
  { id: "cap-15", lat: 36.98995, lng: -120.45255 },
  { id: "cap-16", lat: 36.98982, lng: -120.45135 },
  { id: "cap-17", lat: 36.98962, lng: -120.4501 },
  { id: "cap-18", lat: 36.98938, lng: -120.44885 },
];

function MapController({
  focus,
  allBounds,
  parcelBounds,
  userLocation,
}: {
  focus: MapFocus;
  allBounds: L.LatLngBounds;
  parcelBounds: L.LatLngBounds;
  userLocation: LatLngTuple | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focus === "parcel") {
      map.fitBounds(parcelBounds, { padding: [52, 52], maxZoom: 16 });
      return;
    }

    if (focus === "user" && userLocation) {
      map.flyTo(userLocation, 18, { duration: 0.8 });
      return;
    }

    const bounds = L.latLngBounds(allBounds.getSouthWest(), allBounds.getNorthEast());
    if (userLocation) {
      bounds.extend(userLocation);
    }
    map.fitBounds(bounds, { padding: [26, 26], maxZoom: 14 });
  }, [allBounds, focus, map, parcelBounds, userLocation]);

  return null;
}

export function TravailLiveMap({ focus, overlay }: TravailLiveMapProps) {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);

  useEffect(() => {
    if (focus !== "user" || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setUserLocation(parcelCenter);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [focus]);

  const parcelBounds = useMemo(() => getPolygonBounds([selectedParcel]), []);
  const visibleBounds = useMemo(() => getPolygonBounds([selectedParcel]), []);

  return (
    <MapContainer
      center={parcelCenter as LatLngExpression}
      zoom={14}
      zoomControl={false}
      scrollWheelZoom
      attributionControl={false}
      className="travail-live-map-canvas"
    >
      <TileLayer
        attribution="Tiles &copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <MapController
        focus={focus}
        allBounds={visibleBounds}
        parcelBounds={parcelBounds}
        userLocation={userLocation}
      />

      <Polygon
        positions={selectedParcel.positions}
        pathOptions={{
          color: "#ffbc17",
          weight: 3,
          fillColor: "#e8c46d",
          fillOpacity: 0.44,
        }}
      />

      {overlay === "heatmap"
        ? capturePoints.map((point) => (
            <Circle
              key={point.id}
              center={[point.lat, point.lng]}
              radius={42}
              pathOptions={{
                stroke: false,
                fillColor: "#f97316",
                fillOpacity: 0.16,
              }}
            />
          ))
        : null}

      {capturePoints.map((point) => (
        <Circle
          key={point.id}
          center={[point.lat, point.lng]}
          radius={16}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        />
      ))}

      {userLocation ? (
        <>
          <Circle
            center={userLocation}
            radius={18}
            pathOptions={{
              stroke: false,
              fillColor: "#2563eb",
              fillOpacity: 0.14,
            }}
          />
          <Marker position={userLocation} icon={userIcon} />
        </>
      ) : null}
    </MapContainer>
  );
}

type TravailParcelPreviewMapProps = {
  parcelIndex?: number;
};

export function TravailParcelPreviewMap({ parcelIndex = 0 }: TravailParcelPreviewMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const previewParcel = kmlParcels[parcelIndex % kmlParcels.length] ?? kmlParcels[0];

  useEffect(() => {
    const mapElement = mapRef.current;

    if (!mapElement) {
      return;
    }

    const map = L.map(mapElement, {
      attributionControl: false,
      boxZoom: false,
      doubleClickZoom: false,
      dragging: false,
      keyboard: false,
      scrollWheelZoom: false,
      touchZoom: false,
      zoomControl: false,
    });
    const parcelBounds = getPolygonBounds([previewParcel]);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri" }
    ).addTo(map);

    L.polygon(previewParcel.positions, {
      color: "#ffbc17",
      fillColor: "#e8c46d",
      fillOpacity: 0.44,
      weight: 3,
    }).addTo(map);

    const fitPreviewMap = () => {
      map.invalidateSize();
      map.fitBounds(parcelBounds, { padding: [22, 22], maxZoom: 15 });
    };

    // Retry several times to handle sheet slide-up animation
    fitPreviewMap();
    const t1 = window.setTimeout(fitPreviewMap, 80);
    const t2 = window.setTimeout(fitPreviewMap, 200);
    const t3 = window.setTimeout(fitPreviewMap, 420);

    const ro = new ResizeObserver(() => fitPreviewMap());
    ro.observe(mapElement);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ro.disconnect();
      map.remove();
    };
  }, [previewParcel]);

  return <div ref={mapRef} className="travail-parcel-preview-map-canvas" aria-hidden="true" />;
}
