export default class LabelHelper {
  static printLabel(items, boards = false) {
    var boardXml = `<?xml version="1.0" encoding="utf-8"?>
    <DieCutLabel Version="8.0" Units="twips" MediaType="Default">
      <PaperOrientation>Portrait</PaperOrientation>
      <Id>LargeShipping</Id>
      <IsOutlined>false</IsOutlined>
      <PaperName>30256 Shipping</PaperName>
      <DrawCommands>
        <RoundRectangle X="0" Y="0" Width="3331" Height="5715" Rx="270" Ry="270" />
      </DrawCommands>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Center</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">//////////////////////////////////////////////////////////</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="164.317757009346" Y="361.233644859813" Width="2984.07476635514" Height="199.626168224299" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT_1</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Center</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">//////////////////////////////////////////////////////////</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="149.598130841121" Y="5076.53271028038" Width="2984.07476635514" Height="199.626168224299" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT_2</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Board Size:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="279.158878504673" Y="702.168224299065" Width="1541.3831775701" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT__1</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Cake:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="285.971962616823" Y="1584.64485981308" Width="1541.3831775701" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>BOARD_SIZE</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">RND FU 10</String>
              <Attributes>
                <Font Family="Arial" Size="22" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="264.439252336448" Y="902.77570093458" Width="2793.86915887851" Height="529.794392523364" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT___1</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">8 RND</String>
              <Attributes>
                <Font Family="Arial" Size="22" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="253.308411214953" Y="1774.48598130841" Width="2793.86915887851" Height="529.794392523364" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT___2</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Order:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="278.429906542056" Y="2589.14018691589" Width="1164.56074766355" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT____1</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Date:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1570.02803738318" Y="2599.54205607477" Width="1164.56074766355" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT____2</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Daily ID:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="281.654205607477" Y="3432.14018691589" Width="1164.56074766355" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT____3</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Items:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1587.97196261682" Y="3424.96261682243" Width="1164.56074766355" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>TEXT____4</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Customer:</String>
              <Attributes>
                <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="328.308411214953" Y="4160.66355140187" Width="1164.56074766355" Height="181.682242990654" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>NAME</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Joe Smith</String>
              <Attributes>
                <Font Family="Arial" Size="20" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="292.785046728972" Y="4351.23364485982" Width="2793.86915887851" Height="529.794392523364" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>ORDER_ID</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">525864</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="285.242990654206" Y="2875.8785046729" Width="1096.3738317757" Height="321.644859813083" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>DATE</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Tue. Jun 18</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1569.66355140187" Y="2875.51401869159" Width="1394.24299065421" Height="422.130841121494" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>ID</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">T1</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="292.056074766355" Y="3690.16822429907" Width="877.457943925236" Height="321.644859813083" />
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>COUNT</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">1/1</String>
              <Attributes>
                <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1576.47663551402" Y="3711.33644859814" Width="877.457943925236" Height="321.644859813083" />
      </ObjectInfo>
    </DieCutLabel>`;

    var labelXml = `<?xml version="1.0" encoding="utf-8"?>
    <DieCutLabel Version="8.0" Units="twips" MediaType="Default">
      <PaperOrientation>Portrait</PaperOrientation>
      <Id>LargeShipping</Id>
      <IsOutlined>false</IsOutlined>
      <PaperName>30256 Shipping</PaperName>
      <DrawCommands>
        <RoundRectangle X="0" Y="0" Width="3331" Height="5715" Rx="270" Ry="270"/>
      </DrawCommands>
      <ObjectInfo>
        <TextObject>
          <Name>SIZE</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">16RND</String>
              <Attributes>
                <Font Family="Helvetica" Size="36" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="171.2094" Y="335.9998" Width="2808" Height="877.5938"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>Labels_2</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>None</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">Flavor:
          
          
Filling:
    
          
          
Order:                 Date:
    
    
Daily ID:              Items:
    
    
    
Name:</String>
              <Attributes>
                <Font Family="Helvetica" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="231.6" Y="1296" Width="2736" Height="4153.516"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>FLV</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">CHOC CHIP</String>
              <Attributes>
                <Font Family="Helvetica" Size="13" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="216" Y="1512" Width="2540" Height="432"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>FIL</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">CHOC CHIP</String>
              <Attributes>
                <Font Family="Helvetica" Size="13" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="216" Y="2260.8" Width="2540" Height="432"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>NAME</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Middle</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">EDWARD BERNAL</String>
              <Attributes>
                <Font Family="Helvetica" Size="18" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="216" Y="4896" Width="2540" Height="432"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>ID</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">TH01</String>
              <Attributes>
                <Font Family="Helvetica" Size="13" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="216" Y="3988.8" Width="1281.6" Height="432"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>COUNT</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">10/10</String>
              <Attributes>
                <Font Family="Helvetica" Size="13" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1728" Y="3988.8" Width="1281.6" Height="432"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>ORDER</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>True</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">99999</String>
              <Attributes>
                <Font Family="Helvetica" Size="13" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="216" Y="3254.4" Width="1277.359" Height="288"/>
      </ObjectInfo>
      <ObjectInfo>
        <TextObject>
          <Name>DATE</Name>
          <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
          <LinkedObjectName />
          <Rotation>Rotation0</Rotation>
          <IsMirrored>False</IsMirrored>
          <IsVariable>False</IsVariable>
          <GroupID>-1</GroupID>
          <IsOutlined>False</IsOutlined>
          <HorizontalAlignment>Left</HorizontalAlignment>
          <VerticalAlignment>Top</VerticalAlignment>
          <TextFitMode>ShrinkToFit</TextFitMode>
          <UseFullFontHeight>True</UseFullFontHeight>
          <Verticalized>False</Verticalized>
          <StyledText>
            <Element>
              <String xml:space="preserve">88/88/88</String>
              <Attributes>
                <Font Family="Helvetica" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100"/>
              </Attributes>
            </Element>
          </StyledText>
        </TextObject>
        <Bounds X="1728" Y="3254.4" Width="1355.219" Height="288"/>
      </ObjectInfo>
    </DieCutLabel>`;

    var double_printer = false;

    var label = window.dymo.label.framework.openLabelXml(labelXml);

    if (boards) {
      label = window.dymo.label.framework.openLabelXml(boardXml);
    }

    var labelSetBuilder = new window.dymo.label.framework.LabelSetBuilder();
    var record;
    if (double_printer) {
      var labelSetBuilder2 = new window.dymo.label.framework.LabelSetBuilder();
      var record2;
    }

    // first label
    var left = false;
    Object.keys(items).forEach((key) => {
      if (double_printer) {
        if (items[key]) {
          Object.keys(items[key]).forEach((i) => {
            left = !left;
            if (items[key][i]) {
              Object.keys(items[key][i]).forEach((x) => { 
                
                if (left) {
                  record = labelSetBuilder.addRecord();
                  } else {
                  record2 = labelSetBuilder2.addRecord();
                  }

              if (items[key][i][x]) {
                  Object.keys(items[key][i][x]).forEach((y) => {
                    if (left) {
                      record.setText(y, items[key][i][x][y]);
                    } else {
                      record2.setText(y, items[key][i][x][y]);
                    }
                  });
                }
              });
            }
          });

        }
      } else {
        if (items[key]) {
          Object.keys(items[key]).forEach((i) => {
            if(items[key][i]) {
              Object.keys(items[key][i]).forEach((x) => { 
                record = labelSetBuilder.addRecord();
              if (items[key][i][x]) {
                  Object.keys(items[key][i][x]).forEach((y) => {
                  record.setText(y, items[key][i][x][y]);
                  });
                }
              });
            }
          });
        }
      }
    });

    // select printer to print on
    // for simplicity sake just use the first LabelWriter printer
    var printers = window.dymo.label.framework.getPrinters();
    if (printers.length === 0)
      throw new Error("No DYMO printers are installed. Install DYMO printers.");

    var printerName = "";
    for (var i = 0; i < printers.length; ++i) {
      var printer = printers[i];
      if (printer.printerType === "LabelWriterPrinter") {
        printerName = printer.name;
        break;
      }
    }

    if (printerName === "")
      throw new Error(
        "No LabelWriter printers found. Install LabelWriter printer"
      );

    var d = window.dymo.label.framework.createLabelWriterPrintParamsXml({
      twinTurboRoll: "Left",
    });
    label.print(printerName, d, labelSetBuilder);

    if (double_printer) {
      var p = window.dymo.label.framework.createLabelWriterPrintParamsXml({
        twinTurboRoll: "Right",
      });
      label.print(printerName, p, labelSetBuilder2);
    }
  }
}
