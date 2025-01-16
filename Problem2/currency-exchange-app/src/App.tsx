import { useEffect, useState } from 'react'
import './App.scss'
import { AutoComplete, Button, Col, Form, Input, InputNumber, Row } from 'antd'
import { CloseSquareFilled } from '@ant-design/icons';
import TokenImage from './components/TokenImage';



type Json = {
  currency: string;
  date: string;
  price: number;
}
type OptionCurrency = {
  label: string;
  value: number;
}
function App() {
  const [Problem2Form] = Form.useForm()
  const [data, setData] = useState<Json[]>([])
  const [optionForExchange, setOptionForExchange] = useState<OptionCurrency[]>([])
  const [optionForConvert, setOptionForConvert] = useState<OptionCurrency[]>([])
  const [exchangePrice, setExchangePrice] = useState<number>()
  const [exchangeLabel, setExchangeLabel] = useState<string>('')
  const [convertedPrice, setConvertedPrice] = useState<number>()
  const [convertedLabel, setConvertedLabel] = useState<string>('')
  const [exchangeRate, setExchangeRate] = useState<number>()

  function generateKey(length = 16) {
    let key = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return key;
  }


  const getDecimal = (num: number): number => {
    const numStr = num.toString();
    if (numStr.includes('.')) {
      return numStr.split('.')[1].length;
    }
    return 0;
  };

  const fetchData = async () => {
    const apiUrl = 'https://interview.switcheo.com/prices.json';

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("HTTP error! status: ${ response.status }");
      }

      const fetchedData = await response.json();
      // Because I saw in the json have many duplicate data, so I decide to filter it with priorities: date => most decimal price
      const filterDuplicates = (data: Json[]): Json[] => {
        const filterdData = data.reduce<Json[]>((acc, item) => {
          const existingItem = acc.find((i) => i.currency === item.currency);

          if (!existingItem) {
            // If no existing entry, add the current item
            return [...acc, item];
          }

          const existingDate = new Date(existingItem.date);
          const currentDate = new Date(item.date);

          // Determine priority: 1. Nearest date 2. Most decimal places in price
          const shouldReplace =
            currentDate > existingDate || // Prioritize nearest date
            (currentDate.getTime() === existingDate.getTime() &&
              getDecimal(item.price) > getDecimal(existingItem.price)); // Break ties with decimals

          if (shouldReplace) {
            return acc.map((i) => (i.currency === item.currency ? item : i)); // Replace with higher priority item
          }

          return acc; // Keep the existing item
        }, []);
        return filterdData
      };
      setData(filterDuplicates(fetchedData).map((item: Json) => ({ ...item, key: generateKey() })))
      setOptionForExchange(filterDuplicates(fetchedData).map((item: Json) => (
        { ...item, label: item.currency, value: item.price }
      )))
      setOptionForConvert(filterDuplicates(fetchedData).map((item: Json) => (
        { ...item, label: item.currency, value: item.price }
      )))
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [])

  const onFinish = (values: any) => {
    if (exchangePrice && convertedPrice) {
      exchangeCurrency(values.ExchangeAmount, exchangePrice, convertedPrice)
    }
  };

  const onSelectCurrency = (selectedValue: string, type: string) => {
    //Convert selectedValue into number
    type === "exchange" ? setExchangePrice(+selectedValue) : setConvertedPrice(+selectedValue)
    const selectedOption = (type === "exchange" ? optionForExchange : optionForConvert).find((option) => option.value === +selectedValue);
    if (selectedOption) {
      type === "exchange" ? setExchangeLabel(selectedOption.label) : setConvertedLabel(selectedOption.label); // Show the label after selection
    }
  };

  // Handle input change
  const onChange = (value: string, type: string) => {
    const selectedOption = (type === "exchange" ? optionForExchange : optionForConvert).find((option) => option.value === +value);

    if (!value) {
      Problem2Form.setFieldValue("ConvertedAmount", "")
      setExchangeRate(0)
      const filteredData = data?.map((item) => ({ ...item, label: item.currency, value: item.price }));
      type === "exchange" ? setExchangePrice(0) : setConvertedPrice(0)
      type === "exchange" ? setOptionForExchange(filteredData) : setOptionForConvert(filteredData) // Reset suggestions if the input is empty
    }
    if (selectedOption) {
      type === "exchange" ? setExchangeLabel(selectedOption.label) : setConvertedLabel(selectedOption.label); // Show the label after selection
      Problem2Form.setFieldValue(type === "exchange" ? "currencyExchange" : "currencyConvert", selectedOption.label)
    }
  };
  const onSearch = (searchText: string, type: string) => {
    if (!searchText) {
      const filteredData = data?.map((item) => ({ ...item, label: item.currency, value: item.price }));
      type === "exchange" ? setOptionForExchange(filteredData) : setOptionForConvert(filteredData) // Reset suggestions if the input is empty
      return;
    }

    // Filter data to generate suggestions
    const filteredData = data
      ?.filter((item) => item.currency.toLowerCase().includes(searchText.toLowerCase()))
      ?.map((item) => ({ ...item, label: item.currency, value: item.price }));

    type === "exchange" ? setOptionForExchange(filteredData) : setOptionForConvert(filteredData);
  };

  const exchangeCurrency = (amount: number, baseCurrency: number, targetCurrency: number) => {
    // Calculate exchanged amount
    const baseToTargetRate = baseCurrency / targetCurrency
    setExchangeRate(baseToTargetRate)
    Problem2Form.setFieldValue("ConvertedAmount", amount * baseToTargetRate)
  };

  return (
    <>
      {/* You may reorganise the whole HTML, as long as your form achieves the same effect.  */}
      <div className="container">
        <div className='form'>
          <h2 className='form-title'>Currency Exchange</h2>
          <Form
            name="Problem2Form"
            form={Problem2Form}
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
            className='form-exchange'>
            <h2>Exchange Amount</h2>
            <Row gutter={2} align={"middle"} style={{ marginBottom: "20px" }}>
              <Col span={12}>
                <Row align={"middle"} style={{ gap: "5px" }}>
                  {(exchangeLabel && exchangePrice) ? (
                    <Col>
                      <TokenImage token={exchangeLabel} />
                    </Col>
                  ) : (<></>)}
                  <Col>
                    <Form.Item
                      name="currencyExchange"
                      className="form-item-column"
                      rules={[{ required: true, message: "Please select a currency!" }]}
                    >
                      <AutoComplete
                        key={123}
                        value={exchangeLabel}
                        options={optionForExchange}
                        style={{ width: 100 }}
                        onSelect={(item) => onSelectCurrency(item, "exchange")}
                        onSearch={(item) => onSearch(item, "exchange")}
                        onChange={(item) => onChange(item, "exchange")}
                        allowClear={{ clearIcon: <CloseSquareFilled /> }}
                        placeholder="Currency"
                      />
                    </Form.Item>
                  </Col>
                </Row>

              </Col>
              <Col span={12}>
                <Form.Item
                  name="ExchangeAmount"
                  rules={[{ required: true, message: 'Please input your amount!' }]}
                  className="form-item-column">
                  <InputNumber key={3} placeholder='Amount' width={"100%"} onChange={(values) => {
                    if (!values) {
                      Problem2Form.setFieldValue("ConvertedAmount", "")
                      setExchangeRate(0)
                    }
                  }} />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <h2>Converted Amount</h2>
            <Row gutter={2} align={"middle"}>
              <Col span={12}>
                <Row align={"middle"} style={{ gap: "5px" }}>
                  {(convertedLabel && convertedPrice) ? (
                    <Col>
                      <TokenImage token={convertedLabel} />
                    </Col>
                  ) : (<></>)}
                  <Col>
                    <Form.Item
                      name="currencyConvert"
                      className="form-item-column"
                      rules={[{ required: true, message: "Please select a currency!" }]}
                    >
                      <AutoComplete
                        key={231}
                        value={convertedLabel}
                        options={optionForConvert}
                        style={{ width: 100 }}
                        onSelect={(item) => onSelectCurrency(item, "converted")}
                        onSearch={(item) => onSearch(item, "converted")}
                        onChange={(item) => onChange(item, "converted")}
                        allowClear={{ clearIcon: <CloseSquareFilled /> }}
                        placeholder="Currency"
                      />
                    </Form.Item>
                  </Col>
                </Row>

              </Col>
              <Col span={12}>
                <Form.Item
                  name="ConvertedAmount"
                  className="form-item-column"
                >
                  <Input readOnly key={4} placeholder='Amount' width={"100%"} />
                </Form.Item>
              </Col>
            </Row>


            <Form.Item label={null} style={{ marginTop: "20px" }}>
              <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                Exchange
              </Button>
            </Form.Item>
            <Row>
              Exchange Rate
            </Row>
            {exchangeRate ? (
              <Row>
                1 {exchangeLabel} = {exchangeRate} {convertedLabel}
              </Row>
            ) : (<div></div>)}
          </Form>
        </div>
      </div>
    </>
  )
}

export default App