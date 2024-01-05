import { StatusBar } from "expo-status-bar";
import { Text, View, Image, Pressable } from "react-native";
import { Provider, useSelector, useDispatch } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";

const initialState = {
  hoursWorked: 0,
  hoursSlacked: 0,
  money: 0,
  thirst: 0,
  bottleLvl: 1,
  water: 500,
};

const stayHydratedSlice = createSlice({
  name: "Stay hydrated",
  initialState,
  reducers: {
    workOnce: (state) => {
      if (state.thirst < 100) {
        state.thirst += 1 + ~~(Math.random() * 9);
        state.money += 10 + ~~(Math.random() * 10);
        state.hoursWorked++;
      } else {
        state.hoursSlacked++;
      }
    },
    drinkOnce: (state) => {
      amount = state.thirst * 5;
      if (amount <= state.water) {
        state.water -= amount;
        state.thirst = 0;
      } else {
        amount = ~~(state.water / 5);
        state.water -= amount * 5;
        state.thirst -= amount;
      }
    },
    upgradeBottle: (state) => {
      state.money -= Math.pow(state.bottleLvl, 2) * 100;
      state.bottleLvl++;
    },
    refillBottle: (state) => {
      state.money -= (state.bottleLvl * 500 - state.water) / 5;
      state.water = state.bottleLvl * 500;
    },
  },
});

const store = configureStore({
  reducer: stayHydratedSlice.reducer,
});

export default function App() {
  return (
    <View className="w-full h-auto px-12 pt-20">
      <Provider store={store}>
        <Update />
        <Hydration />
      </Provider>
    </View>
  );
}

function Update() {
  const dispatch = useDispatch();

  useEffect(() => {
    var t = 0;
    const iid = setInterval(() => {
      dispatch(stayHydratedSlice.actions.workOnce());
      //console.log("Updater " + iid + " fired!");
    }, 500);
    return () => {
      clearInterval(iid);
    };
  }, []);

  return;
}

function Hydration() {
  var workedFor = useSelector((state) => state.hoursWorked);
  var slackedFor = useSelector((state) => state.hoursSlacked);
  var water = useSelector((state) => state.water);
  var money = useSelector((state) => state.money);
  var thirst = useSelector((state) => state.thirst);
  var bottleLvl = useSelector((state) => state.bottleLvl);

  const dispatch = useDispatch();

  const { upgradePrice, canUpgrade } = (function () {
    const price = Math.pow(bottleLvl, 2) * 100;
    const hasmoney = price <= money;
    return {
      upgradePrice: price,
      canUpgrade: hasmoney,
    };
  })();

  const { refillPrice, canRefill } = (function () {
    const price = (bottleLvl * 500 - water) / 5;
    const hasmoney = price <= money && price > 0;
    return {
      refillPrice: price,
      canRefill: hasmoney,
    };
  })();

  const buttonStyle = "px-3 py-1 bg-indigo-400 rounded shadow";
  const disabledStyle = "px-3 py-1 bg-slate-300 rounded";

  return (
    <View className="w-full flex flex-col gap-1 items-center justify-center">
      <Image
        className="w-80 h-60 mb-4 rounded"
        source={require("./assets/cover.png")}
      />
      <Text
        className={"text-stone-800 text-xl px-2"}
        style={{ fontWeight: "bold" }}
      >
        ⌚ 🤯{workedFor} 😮‍💨{slackedFor} ⌚
      </Text>
      <Text className="text-xl">---------------------------------</Text>
      <View className="w-full flex flex-col gap-1 items-start justify-center">
        <Text
          className={
            (money <= 0 ? "text-rose-800" : "text-stone-800") + " text-xl px-2"
          }
          style={{ fontWeight: "bold" }}
        >
          💵 {money}
        </Text>
        <Text
          className={
            (thirst >= 100 ? "text-rose-800" : "text-stone-800") +
            " text-xl px-2"
          }
          style={{ fontWeight: "bold" }}
        >
          🥵 {thirst}
        </Text>
        <Text className={"text-stone-300 text-xl"}>
          <Text
            className={water <= 0 ? "text-rose-800" : "text-stone-800"}
            style={{ fontWeight: "bold" }}
          >
            💧{water}/{bottleLvl * 500}ml{" "}
          </Text>
          ({(water / (bottleLvl * 5)).toFixed(1)}%)
        </Text>
      </View>
      <Text className="text-xl">---------------------------------</Text>
      <View className="w-full flex flex-col gap-1 items-start justify-center">
        <Pressable
          className={buttonStyle}
          onPress={() => dispatch(stayHydratedSlice.actions.drinkOnce())}
        >
          <Text className="text-lg text-white">Drink!</Text>
        </Pressable>

        <Pressable
          className={canUpgrade ? buttonStyle : disabledStyle}
          disabled={!canUpgrade}
          onPress={() => dispatch(stayHydratedSlice.actions.upgradeBottle())}
        >
          <Text className="text-lg text-white">
            Upgrade bottle ({upgradePrice}💵)
          </Text>
        </Pressable>

        <Pressable
          className={canRefill ? buttonStyle : disabledStyle}
          disabled={!canRefill}
          onPress={() => dispatch(stayHydratedSlice.actions.refillBottle())}
        >
          <Text className="text-lg text-white">
            Refill bottle ({refillPrice}💵)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
