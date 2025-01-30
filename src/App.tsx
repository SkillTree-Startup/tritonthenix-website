import {
  Adapt,
  Button,
  Dialog,
  Fieldset,
  Form,
  H1,
  H2,
  Input,
  Label,
  Paragraph,
  Separator,
  Sheet,
  Switch,
  Tabs,
  Theme,
  XStack,
  YStack,
  Card,
  ScrollView,
  Spinner,
  Progress,
  RadioGroup,
  Checkbox,
  TextArea,
  AlertDialog,
  Tooltip,
} from 'tamagui'
import { useState } from 'react'

function App() {
  const [name, setName] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [tab, setTab] = useState('tab1')
  const [switchOn, setSwitchOn] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [checked, setChecked] = useState(false)

  return (
    <Theme name="light">
      <ScrollView>
        <YStack padding="$4" space="$4">
          <H1>Tamagui Components Demo</H1>

          {/* Forms and Inputs */}
          <Card elevate>
            <Card.Header padded>
              <H2>Forms & Inputs</H2>
            </Card.Header>
            <Form padding="$4" space="$4">
              <Fieldset space="$2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              </Fieldset>

              <Fieldset space="$2">
                <Label htmlFor="textarea">Message</Label>
                <TextArea id="textarea" placeholder="Type your message..." />
              </Fieldset>

              <XStack space="$2">
                <Button themeInverse onPress={() => alert(`Hello, ${name}!`)}>
                  Submit
                </Button>
                <Button theme="red" onPress={() => setName('')}>
                  Clear
                </Button>
              </XStack>
            </Form>
          </Card>

          {/* Interactive Components */}
          <Card elevate>
            <Card.Header padded>
              <H2>Interactive Components</H2>
            </Card.Header>
            <YStack padding="$4" space="$4">
              <XStack space="$4" alignItems="center">
                <Switch checked={switchOn} onCheckedChange={setSwitchOn}>
                  <Switch.Thumb />
                </Switch>
                <Paragraph>Switch is {switchOn ? 'ON' : 'OFF'}</Paragraph>
              </XStack>

              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <YStack space="$2">
                  <XStack space="$4" alignItems="center">
                    <RadioGroup.Item value="option1" id="option1">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="option1">Option 1</Label>
                  </XStack>
                  <XStack space="$4" alignItems="center">
                    <RadioGroup.Item value="option2" id="option2">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="option2">Option 2</Label>
                  </XStack>
                </YStack>
              </RadioGroup>

              <XStack space="$4" alignItems="center">
                <Checkbox id="checkbox" checked={checked} onCheckedChange={setChecked}>
                  <Checkbox.Indicator />
                </Checkbox>
                <Label htmlFor="checkbox">Accept terms</Label>
              </XStack>
            </YStack>
          </Card>

          {/* Progress and Loading */}
          <Card elevate>
            <Card.Header padded>
              <H2>Progress & Loading</H2>
            </Card.Header>
            <YStack padding="$4" space="$4">
              <Progress value={65}>
                <Progress.Indicator />
              </Progress>
              <XStack space="$4">
                <Spinner size="large" />
                <Spinner size="large" color="$green10" />
              </XStack>
            </YStack>
          </Card>

          {/* Theme Examples */}
          <Card elevate>
            <Card.Header padded>
              <H2>Theme Examples</H2>
            </Card.Header>
            <XStack padding="$4" space="$2" flexWrap="wrap">
              <Button themeInverse>Default</Button>
              <Button theme="green">Green</Button>
              <Button theme="red">Red</Button>
              <Button theme="yellow">Yellow</Button>
              <Button theme="purple">Purple</Button>
              <Button theme="pink">Pink</Button>
              <Button theme="orange">Orange</Button>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </Theme>
  )
}

export default App