import React, { useEffect, useState } from 'react';
import { getDistributors } from '../../../../api/distributor';
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import AppView from "../../../../components/AppView"
import { TouchableOpacity, View, Modal, Animated } from "react-native";
import { useSelector } from "react-redux";
import { AppText } from "../../../../components";
import FloatingInput from "../../../../components/form/floatingInput";
import Svg, { Path } from "react-native-svg";

const RenderStockist = React.memo(({
  index,
  Namestockist,
  distributorCode,
  City,
  onRemove,
}) => {
  return (
    <AppView>
      <AppView
        marginTop={15}
        flexDirection="row"
        justifyContent="space-between"
        paddingHorizontal={10}
      >
        <AppText fontSize={14}>Stockist {index}</AppText>

        <TouchableOpacity onPress={onRemove}>
          <Svg
            width="18"
            height="18"
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M10.125 2.54167L9.76333 8.38958C9.67117 9.8835 9.62508 10.6308 9.25 11.168C9.06483 11.4335 8.82645 11.6576 8.55 11.826C7.99175 12.1667 7.24333 12.1667 5.7465 12.1667C4.24733 12.1667 3.49775 12.1667 2.93833 11.8254C2.66177 11.6567 2.42337 11.4322 2.23833 11.1663C1.86383 10.6284 1.81833 9.88 1.7285 8.38375L1.375 2.54167M0.5 2.54167H11"
              stroke="#909090"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </AppView>

      <AppView>
        <FloatingDropdown {...Namestockist} />
      </AppView>

      <AppView marginTop={5}>
        <FloatingInput {...distributorCode} />
      </AppView>

      <AppView marginTop={5}>
        <FloatingInput {...City} />
      </AppView>
    </AppView>
  );
});

const StockistSection = ({
  formData,
  setValue,
}) => {
  const [stockistOptions, setStockistOptions] = useState([]);
  const loggedInUser = useSelector(state => state.auth.user);
  const [stockistSearch, setStockistSearch] = useState('');


  const removeStockist = (index) => {
    handleSetValue(
      "suggestedDistributors",
      formData?.suggestedDistributors?.filter((item, i) => i !== index)
    );
  };




  useEffect(() => {
    const fetchDistributors = async () => {
      // Case 1: no station & no search → use formData only
      if (!loggedInUser?.stationCode && !stockistSearch) {
        if (formData?.suggestedDistributors?.length) {
          setStockistOptions(
            formData.suggestedDistributors
              .filter(item => item.distributorCode || item.distributorName)
              .map(item => ({
                id: item.distributorCode,
                name: item.distributorName,
                code: item.distributorCode,
                cityName: item.city ?? null,
              }))
          );
        } else {
          setStockistOptions([]);
        }
        return;
      }

      // ✅ ALWAYS fetch full list from API
      const response = await getDistributors(
        1,
        30,
        stockistSearch,
        loggedInUser?.stationCode ?? null,
        loggedInUser?.userDetails?.divisionIds ?? []
      );

      if (response?.distributors?.length) {
        setStockistOptions(
          response.distributors.map(item => ({
            id: item.code,
            name: item.name,
            code: item.code,
            cityName: item.cityName ?? null,
          }))
        );
      } else {
        setStockistOptions([]);
      }
    };

    fetchDistributors();
  }, [
    loggedInUser?.stationCode,
    stockistSearch,
    formData?.suggestedDistributors
  ]);
  const getFilteredOptions = (currentIndex, currentCode) => {
    const selectedCodes = new Set(
      formData?.suggestedDistributors
        ?.filter((_, i) => i !== currentIndex)
        ?.map(item => item.distributorCode)
        ?.filter(Boolean)
    );

    return stockistOptions.filter(
      option =>
        option.code === currentCode || // ✅ keep current row selection
        !selectedCodes.has(option.code)
    );
  };
  const updateStockist = (index, updates) => {
    setValue(prev => ({
      ...prev,
      suggestedDistributors: prev.suggestedDistributors.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleStockistSearch = (text) => {
    setStockistSearch(text);
  };

  return (
    <>
      {formData?.suggestedDistributors?.map((e, i) => (
        <RenderStockist
          key={i}
          index={i + 1}
          Namestockist={{
            rightIcon: false,
            label: `Name of the Stockist ${i + 1}`,
            searchTitle: 'Stockist',
            selected: e.distributorCode ? e.distributorCode : null,

            options: getFilteredOptions(i, e.distributorCode),
            onSelect: (item) => {
              updateStockist(i, {
                distributorName: item.name,
                distributorCode: item.code,
                city: item.cityName,
              });
            },
            onSearch: handleStockistSearch
          }}
          distributorCode={{
            label: 'Distributor Code',
            value: e.distributorCode,
            onChangeText: (text) =>
              updateStockist(i, { distributorCode: text }),
          }}
          City={{
            label: 'City',
            value: e.city,
            onChangeText: (text) =>
              updateStockist(i, { city: text }),
          }}
          onRemove={() => removeStockist(i)}
        />
      ))}
    </>
  );
};

export default StockistSection;
