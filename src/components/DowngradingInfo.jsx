import { BiCommand, BiLogoApple, BiLogoWindows } from "react-icons/bi";
import { FaLinux } from "react-icons/fa";
import { useVersion } from "../context/VersionContext";
import { depotsInfo, versionInfo } from "../data";
import { BsCheckLg, BsCopy, BsExclamationCircle, BsExclamationOctagon, BsExclamationTriangle, BsInfoCircle, BsLink45Deg, BsOption, BsSteam } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { Popover } from "react-tiny-popover";
import { copy } from "@stianlarsen/copy-to-clipboard";

const idDowngradingSection = "downgrading";
const idSaveLocationCard = "savelocation";
const idManifestsSection = "manifeststable";

const _unknown_manifest = <span style={{color:'red'}}>info not gathered</span>
const issueReportingAdvice = <>
  If these instructions do not work, please let me know
  by posting a <a href="https://www.github.com/rodriguezrrp/penguinheist-save-editor/issues">
    Github issue
  </a>
  .
</>;

export default function DowngradingInfo() {
  // console.log('DowngradingInfo created');

  const version = useVersion();
  const info = versionInfo[version] ?? {};
  let versionName = info.name || info.long_name;
  if(!versionName)
    versionName = <span style={{color:'red'}}>unknown version name</span>;
  else if(info.name_suffix)
    versionName = <>{versionName} <span>{info.name_suffix}</span></>;
  const manifestWindows = info.manifest_windows || <span style={{color:'red'}}>&lt;missing Manifest ID info!&gt;</span>;
  const manifestMacOS = info.manifest_macos || <span style={{color:'red'}}>&lt;missing Manifest ID info!&gt;</span>;
  const manifestLinux = info.manifest_linux || <span style={{color:'red'}}>&lt;missing Manifest ID info!&gt;</span>;

  const downgradingSectionRef = useRef();
  const manifestsSectionRef = useRef();

  return <>
    <details id={idDowngradingSection} className="downgrading"
      ref={downgradingSectionRef}
      open={window.location.hash === '#' + idDowngradingSection || window.location.hash === '#' + idSaveLocationCard}
    >
      <summary className="title-row">
        <div className="title-header-flex">
          <svg className="icon category-icon" 
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            {/* fill-rule changed to fillRule for React */}
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"></path>
          </svg>
          
          {/* <BiChevronRight className="icon category-icon" /> */}
          <span style={{fontWeight:'initial'}}>
            How to download and run older game versions (Downpatching or Downgrading)
          </span>
          
          {/* <button type="button" className="details-link">
            <BsLink45Deg title="Link to this section" aria-label="Link to this section" className="icon" />
          </button> */}
          {/* <a className="details-link" href="https://example.com"> */}
          <a className="details-link"
            href={window.location.origin + window.location.pathname + '#' + idDowngradingSection}
            onClick={(e) => {if(downgradingSectionRef?.current) downgradingSectionRef.current.open = true;}}
          >
            <BsLink45Deg title="Link to this section" aria-label="Link to this section" className="icon" />
          </a>
        </div>
      </summary>
      <div className="text-container">
        
        <p className="form-text">
          {issueReportingAdvice}
        </p>

        <h3>Instructions to download selected version "{versionName}"</h3>
        <p>
          <em>For other game versions</em>: select desired game version in "Version" selector above, or refer to
          the Reference Table section <a
            href={window.location.origin + window.location.pathname + '#' + idManifestsSection}
            onClick={(e) => {if(manifestsSectionRef?.current) manifestsSectionRef.current.open = true;}}
          >
            below
          </a>.
        </p>
        <p className="form-text">
          Note: when copying file names and commands, <em>DO NOT include</em> quotation marks ("") surrounding them.
        </p>

        <ol>
          <li>
            <h3>Open Steam Console</h3>
            <p>First, open the Steam Console.</p>
            
            <ul className="listicons">
              <li className="listicons inst-windows">
                <span className="listicons">
                  <BiLogoWindows aria-hidden="true" className="icon" />
                  <BiLogoApple aria-hidden="true" className="icon" />
                  <FaLinux aria-hidden="true" className="icon" />
                </span>
                <p>
                  Open a browser and enter "
                  <a href="steam://open/console">
                    <span className="mono-text inline-code">steam://open/console</span>
                  </a>" in the address bar at the top.
                  Then hit Enter. If the browser asks to open the link with Steam, allow it.
                </p>
                <p className="form-text">
                  If "<span className="mono-text">steam://open/console</span>" does not work,
                  you could try "<span className="mono-text">steam://nav/console</span>".
                  (See <a href="https://developer.valvesoftware.com/wiki/Steam_browser_protocol#:~:text=steam%3A%2F%2Fnav%2F%3Ccomponent%3E">
                    wiki
                  </a>)
                </p>
              </li>
            </ul>

            <p>
              Or:
            </p>
            
            <ul className="listicons">
              <li className="listicons inst-windows">
                <p>
                  <span className="listicons"><BiLogoWindows aria-hidden="true" className="icon" /></span>
                  On Windows:
                  {/* Open a browser and enter "<span className="mono-text inline-code">steam://open/console</span>" in the address bar at the top.
                  Then hit Enter. If the browser asks to open the link with Steam, allow it. */}

                  {/* </p><p><em>Or:</em>&nbsp;
                  <br/> */' '}
                  Open the Run dialog box with <strong><BiLogoWindows title="Windows key" aria-label="Windows key" className="icon" />+R</strong>,
                  <br/>then enter the command "<span className="mono-text inline-code">steam://open/console</span>". Click Ok.
                </p>
              </li>
              <li className="listicons inst-macos">
                <p>
                  <span className="listicons"><BiLogoApple aria-hidden="true" className="icon" /></span>
                  On MacOS:
                  {/* Open a browser and enter "<span className="mono-text inline-code">steam://open/console</span>" in the address bar at the top.
                  Then hit Enter. If the browser asks to open the link with Steam, allow it. */}

                  {/* </p><p><em>Or:</em>&nbsp;
                  <br/> */' '}
                  Open the Terminal by pressing <strong><BiCommand title="Command key" aria-label="Command key" className="icon" />+Space</strong>,
                  searching for "Terminal" and opening it.
                  Then copy and paste "<span className="mono-text inline-code">/Applications/Steam.app/Contents/MacOS/steam_osx -console</span>" and press enter.
                </p>
              </li>
              <li className="listicons inst-linux">
                <p>
                  <span className="listicons">
                    <FaLinux aria-hidden="true" className="icon" />
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="icon" aria-hidden="true" viewBox="0 0 448 512">
                      <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                      <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z" />
                    </svg> */}
                  </span>
                  On Linux: 
                  {/* Open a browser and enter "<span className="mono-text inline-code">steam://open/console</span>" in the address bar at the top.
                  Then hit Enter. If the browser asks to open the link with Steam, allow it. */}
                  
                  {/* </p><p><em>Or:</em>&nbsp;
                  <br/> */' '}
                  Open the Terminal. How to do this depends on your distribution,
                  but you can try: <strong>Ctrl+Alt+T</strong>,
                  or <strong>Ctrl+T</strong>, or <strong>Alt+T</strong>,
                  or searching for "Terminal" in the show applications menu,
                  or right-clicking the desktop and selecting "Open in Terminal".
                  <br/>Then, in the terminal, type "<span className="mono-text inline-code">steam -console</span>" and press enter.
                </p>
              </li>
              {/* <li className="listicons">
                <p className="form-text">
                  If "<span className="mono-text">steam://open/console</span>" does not work,
                  you could try "<span className="mono-text">steam://nav/console</span>".
                  (See <a href="https://developer.valvesoftware.com/wiki/Steam_browser_protocol#:~:text=steam%3A%2F%2Fnav%2F%3Ccomponent%3E">
                    wiki
                  </a>)
                </p>
              </li> */}
            </ul>
            
            <p>This should open Steam with a "Console" tab showing.</p>
          </li>
          
          <li>
            <h3>Download the depot manifest using Steam Console</h3>
            <p>Inside the steam console, enter the following command depending on your operating system:</p>
            
            <ul className="listicons">
              <li className="listicons inst-windows">
                <span className="listicons"><BiLogoWindows aria-hidden="true" className="icon" /></span>
                On Windows: "<span className="mono-text inline-code">download_depot 1451480 {depotsInfo.depot_windows} {manifestWindows}</span>"
              </li>
              <li className="listicons inst-macos">
                <span className="listicons"><BiLogoApple aria-hidden="true" className="icon" /></span>
                On MacOS: "<span className="mono-text inline-code">download_depot 1451480 {depotsInfo.depot_macos} {manifestMacOS}</span>"
              </li>
              <li className="listicons inst-linux">
                <span className="listicons">
                  <FaLinux aria-hidden="true" className="icon" />
                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="icon" aria-hidden="true" viewBox="0 0 448 512">
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z" />
                  </svg> */}
                </span>
                On Linux: "<span className="mono-text inline-code">download_depot 1451480 {depotsInfo.depot_linux} {manifestLinux}</span>"
              </li>
            </ul>

            <p>
              You should see a message like "<span className="mono-text">Downloading Depot 1451481 ...</span>" appear.
              This means it is downloading. <em>(Depot ID may vary!)</em>
            </p>
            <p className="form-text">
              You may have to <strong>wait a while</strong>; most versions of this game are around 1-2 GB compressed.
            </p>
            
            <ul className="listicons">
              <li className="listicons">
                <h4>
                  <span className="listicons">
                    {/* <i className="bi-question-octagon-fill" aria-hidden="true"></i> */}
                    <BsExclamationOctagon aria-hidden className="icon" />
                  </span>
                  What if I saw an error instead? Such as "Depot download failed : ..."?
                </h4>
                <p>First, check that your Depot ID and Manifest ID are correct! That can be done by checking the Reference Table section below,
                  or looking it up in the <a href="https://steamdb.info/app/1451480/depots/">SteamDB depots</a> for this game.
                  {/* <br/>Note: For the same game version there exist three different Manifest IDs, one from each Depot (desired operating system).
                  Check that your Manifest ID and Depot ID are for the same operating system. */}
                  <br/>Note: each operating system has its own Depot ID,
                  and every game version has a different Manifest ID depending on the Depot it is in.
                  (In other words: every game version has three different Manifest IDs, one for each Depot.)
                </p>
                <p>If they are correct and you still receive an error, you can try using the well-known third-party tool <a href="https://github.com/SteamRE/DepotDownloader">DepotDownloader</a>.
                  I recommend <a href="https://youtu.be/44HBxzC_RTg">this video</a> as a tutorial. It was for the Hollow Knight game community, so be sure to use <em>your</em> App ID, Depot ID, and Manifest ID <em>in place of theirs</em> in the video.</p>
              </li>
            </ul>
          </li>
          
          <li>
            <h3>Locate and Move Download</h3>
            <p>After a successful download you should see a message that looks something like:
              <br/><span className="mono-text">Depot download complete : "&lt;Path to download folder location&gt;" (&lt;...&gt; files, manifest &lt;Manifest ID&gt;)</span>
              {/* <!-- <ul><li>
                For example, on Windows, for Patch + Cosmetics + Heist Planner Update:
                <br/><span className="mono-text">Depot download complete : "C:\Program Files (x86)\Steam\steamapps\content\app_1451480\depot_1451481" (273 files, manifest 6080836104571247089)</span>
              </li></ul> --> */}
              <br/>
              Depot ID and manifest will vary depending on your operating system and version selected. The path will often end in something like ".../app_1451480/depot_1451481".
            </p>
            <p className="form-text">
              If you see errors afterwards, such as "LogonFailure No Connection", don't worry. After "Depot download complete" you already have the files you needed.
            </p>
            {/* <p> */}
              <p>
                Go to the download folder location, and you should see contents in that folder structured something like this:
              </p>
              <ul className="listicons highlight-exe-hover-parent">
                <li className="listicons inst-windows">
                  <span className="listicons"><BiLogoWindows aria-label="On Windows" /></span>
                  <p className="mono-text" style={{fontWeight:'normal', lineHeight: 'normal', fontSize: '0.8rem'}}>
                    &lt;download folder&gt;
                    <br/>├── MonoBleedingEdge
                    <br/>├── Penguin Heist_Data
                    <br/>├── <span className="highlight-exe-hover-child">Penguin Heist.exe</span>
                    <br/>├── UnityCrashHandler64.exe
                    <br/>└── UnityPlayer.dll
                  </p>
                </li>
                <li className="listicons inst-macos">
                  <span className="listicons"><BiLogoApple  aria-label="On Mac OS" /></span>
                  <p className="mono-text" style={{fontWeight:'normal', lineHeight: 'normal', fontSize: '0.8rem'}}>
                    &lt;download folder&gt;
                    <br/>└── Penguin Heist.app
                    <br/>&nbsp;&nbsp;&nbsp;└── Contents
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── _CodeSignature
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── Frameworks
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── MacOS
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;└── <span className="highlight-exe-hover-child">Penguin Heist</span>
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── MonoBleedingEdge
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── Plugins
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── Resources
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── Info.plist
                  </p>
                </li>
                <li className="listicons inst-linux">
                  <span className="listicons">
                    <FaLinux aria-label="On Linux" className="icon" />
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="icon" role="img" aria-label="On Linux" viewBox="0 0 448 512">
                      <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                      <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z" />
                    </svg> */}
                  </span>
                  <p className="mono-text fw-normal" style={{lineHeight: 'normal', fontSize: '0.8rem'}}>
                    &lt;download folder&gt;
                    <br/>├── PenguinHeist_Data
                    <br/>├── <span className="highlight-exe-hover-child">PenguinHeist</span>
                    <br/>├── PenguinHeist_s.debug
                    <br/>├── UnityPlayer.so
                    <br/>└── UnityPlayer_s.debug
                  </p>
                </li>
              </ul>
              <p className="form-text">Depending on the game version you download, the contents may look slightly different.</p>
            {/* </p> */}
            <p>
              Those are the files needed to run this copy of the game! Let's <strong>move</strong> these for safety, so Steam doesn't overwrite them.
            </p>
            <ol>
              <li>
                Create another folder somewhere (such as your Desktop or Documents).
              </li>
              <li>
                Copy or move <em>all</em> the files from the download folder to the new folder.
              </li>
            </ol>
          </li>

          <li>
            <h3>Add <span className="mono-text inline-code">steam_appid.txt</span> file for expected Steam api integration</h3>

            <p>
              If you tried running the game version right now, it will likely crash or hang. This is probably because it
              is expecting to find a <span className="mono-text inline-code">steam_appid.txt</span> file, necessary for
              "talking with" Steam.
              <br/>Additionally, this communication with Steam allows Steam to track when you're playing Penguin Heist,
              and its achievements, game hours, etc.
            </p>

            <p>In the folder containing the game executable file (
              <BiLogoWindows aria-label="On Windows" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.exe</span>,
              {' '}<BiLogoApple aria-label="On Mac OS" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.app</span>,
              or <FaLinux aria-label="On Linux" className="icon" /> <span className="mono-text fw-normal">PenguinHeist</span>),
              create a new text file (using Notepad or textedit or any other), and put in
              the digits <span className="mono-text inline-code">1451480</span>, which is this game's Steam App ID. Nothing else!
            </p>
            <p>
              Save the text file as "<span className="mono-text inline-code">steam_appid.txt</span>"
              and put that text file into the same folder, i.e., next to the executable file.
            </p>
            
            <p>
              {/* <i className="bi-check-lg" aria-hidden="true"></i> */}
              <BsCheckLg className="icon" />{' '}
              <strong>Congratulations!</strong> Now you have all the files strictly needed to play this version!
            </p>

            <p>
              Anytime you want to run the game version, just run the game executable file
              (<BiLogoWindows aria-label="On Windows" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.exe</span>,
              {' '}<BiLogoApple aria-label="On Mac OS" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.app</span>,
              or <FaLinux aria-label="On Linux" className="icon" /> <span className="mono-text fw-normal">PenguinHeist</span>),
              e.g. by double-clicking it. You can also create a shortcut to this file and place the shortcut in a convenient location.
            </p>
            <p className="form-text">
              On Mac OS, to run these game files you may need to open a Terminal window with the path located in the folder
              containing <span className="mono-text fw-normal">Penguin Heist.app</span>, and then
              run the command "<span className="mono-text fw-normal">./Penguin Heist.app/Contents/MacOS/Penguin Heist</span>".
            </p>

            <p>
              I do recommend you either create a shortcut to the executable in a convenient location,
              or add the version to Steam (see below), for ease of playing it.
            </p>

            <p className="callout important">
              <BsExclamationTriangle className="icon" />{' '}
              IMPORTANT: See <a
                href={window.location.origin + window.location.pathname + '#' + idSaveLocationCard}
                onClick={(e) => {if(downgradingSectionRef?.current) downgradingSectionRef.current.open = true;}}
              >
                the reminder
              </a> at the bottom of these instructions
              about <strong>where the game saves its data!</strong> <em>Every game version</em>, in <em>any location</em>,
              will always try to read and write the save file to the <strong>same location</strong> as
              the official Steam version does!
            </p>
          </li>

          <li>
            <h3><em>(Optional)</em>: Add to Steam as non-Steam game</h3>
            <p>
              If you want to run this copy of the game from Steam just like you run the original one,
              you can add the game executable to Steam as a non-Steam game.
            </p>
            <p>
              Open the Steam client window
              and select the "Add a Game" on the bottom left &gt; "Add a non-Steam Game" &gt; "Browse", and navigate to the game executable file
              (<BiLogoWindows aria-label="On Windows" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.exe</span>,
              {' '}<BiLogoApple aria-label="On Mac OS" className="icon" /> <span className="mono-text fw-normal">Penguin Heist.app</span>,
              or <FaLinux aria-label="On Linux" className="icon" /> <span className="mono-text fw-normal">PenguinHeist</span>).
              Select it in the file browser. Ensure the game executable is checked and click "Add Selected Programs".
            </p>
            <p>
              Now you can find it in your Library with the same name as the executable file or game. Rename or organize it however you like in Steam.
            </p>
          </li>
        </ol>
      </div>

      {/* <div className="card text-container" style={{margin: '1em', '--border-color': 'var(--grayblue)'}}> */}
      <div id={idSaveLocationCard} className="card" style={{margin: '1em'}}>
        <div className="title-header-flex">
          <h2><BsExclamationCircle className="icon" /> Reminder: Game save file location is the same!</h2>
          
          <a className="details-link"
            href={window.location.origin + window.location.pathname + '#' + idSaveLocationCard}
            onClick={(e) => {if(downgradingSectionRef?.current) downgradingSectionRef.current.open = true;}}
          >
            <BsLink45Deg title="Link to this section" aria-label="Link to this section" className="icon" />
          </a>
        </div>

        <div className="text-container">
          <p>
            No matter which game version or where the game is, it will always try to read and write
            the save file to the <strong>same location!</strong>
          </p>
          <p>
            Keep in mind: playing <>different versions</> using the <>same save file</> can cause <strong>side effects</strong> (often
            small). This is more common if downgrading.
            The game tends to ignore properties that it does not recognize. This changes based on the version.
          </p>
          <p className="form-text">
            For example: the Blueprint Update replaced the research and constructions system
            with a blueprint system. Save files that were created before this change
            kept all the already-owned items available for your loadout, but purchasing items became locked in the shop behind the new blueprints requirements.
          </p>
          <p>
            If you ever want to keep <strong>separate saves</strong> (even for the same game version), I would
            recommend <strong>renaming</strong> or <strong>moving/copying</strong> the save
            folder "<span className="mono-text">Penguin Heist</span>" or file "<span className="mono-text">PHSaveMain.sav</span>"
            to something else, and then the game will leave that save alone.
            <br/>When you want to switch back, you would simply rename or move the new current save,
            and then rename or move the desired one back.
          </p>
          <ul className="listicons">
            <li className="listicons">
              <span className="listicons"><BsInfoCircle aria-hidden="true" className="icon" /></span>
              <p>
                If there's no save folder with the expected name ("<span className="mono-text">Penguin Heist</span>")
                then the game will create a completely new save file and folder, with default values for that game version.
              </p>
            </li>
            <li>
              <ul className="listicons">
                <li className="listicons">
                  <span className="listicons"><BsSteam aria-hidden="true" className="icon" /></span>
                  <p>
                    If synced to Steam, the game may download a save existing in the Steam cloud.
                    To prevent this, run Steam in Offline mode and then launch the game, and it will generate a new save.
                  </p>
                </li>
              </ul>
            </li>
          </ul>
          
          {/* <p>
            <strong>Default save folder locations:</strong>
          </p> */}
          <h3>Default save folder locations:</h3>
          <SaveFolderLocationsList />
        </div>  {/* end inner text-container of card */}
      
      </div>

      <div className="text-container">
        <p className="form-text">
          {issueReportingAdvice}
        </p>
      </div>
    </details>

    <details id={idManifestsSection} className="manifeststable"
      ref={manifestsSectionRef} open={window.location.hash === '#' + idManifestsSection}
    >
      <summary className="title-row">
        <div className="title-header-flex">
          <svg className="icon category-icon" 
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            {/* fill-rule changed to fillRule for React */}
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"></path>
          </svg>
          <span style={{fontWeight:'initial'}}>
            Reference Table for common versions' Manifest IDs
          </span>
          <a className="details-link"
            href={window.location.origin + window.location.pathname + '#' + idManifestsSection}
            onClick={(e) => {if(manifestsSectionRef?.current) manifestsSectionRef.current.open = true;}}
          >
            <BsLink45Deg title="Link to this section" aria-label="Link to this section" className="icon" />
          </a>
        </div>
      </summary>

      <div className="text-container">
        <p className="form-text">
          Note: the majority of this information was obtained from
          SteamDB's <a href="https://steamdb.info/app/1451480/history/">
            history
          </a> and <a href="https://steamdb.info/app/1451480/patchnotes/">
            patch notes
          </a> of this game.
        </p>
                                
        <p>The command looks like "<span className="mono-text inline-code">download_depot &lt;AppID&gt; &lt;DepotID&gt; &lt;ManifestID&gt;</span>".</p>

        <p>
          The App ID is always "1451480" for Penguin Heist.
          <br/>The Depot ID is dependent on the target operating system only:
        </p>
        <ul className="listicons">
          <li className="listicons inst-windows">
            <span className="listicons"><BiLogoWindows aria-hidden="true" className="icon" /></span>
            On Windows: "<span className="game-version-depot-windows">{depotsInfo.depot_windows}</span>"
          </li>
          <li className="listicons inst-macos">
            <span className="listicons"><BiLogoApple aria-hidden="true" className="icon" /></span>
            On MacOS: "<span className="game-version-depot-macos">{depotsInfo.depot_macos}</span>"
          </li>
          <li className="listicons inst-linux">
            <span className="listicons"><FaLinux aria-hidden="true" className="icon" /></span>
            {/* <span className="listicons">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true" viewBox="0 0 448 512">
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z"/>
                </svg>
            </span> */}
            On Linux: "<span className="game-version-depot-linux">{depotsInfo.depot_linux}</span>"
          </li>
        </ul>
        <p>
          The Manifest ID depends on both the Depot and the game version. Refer to the table below:
        </p>
        
        <table id="tableManifests" className="table">
          <colgroup>
            <col />
          </colgroup>
          <colgroup span={3}></colgroup>
          <thead>
            <tr>
              <th rowSpan="2" scope="col">Version Name</th>
              <th colSpan="3" scope="colgroup">Manifest ID for:</th>
            </tr>
            <tr>
              <th scope="col">
                <BiLogoWindows aria-hidden="true" className="icon" />{' '}
                Windows (<span className="game-version-depot-windows">{depotsInfo.depot_windows}</span>)
              </th>
              <th scope="col">
                <BiLogoApple aria-hidden="true" className="icon" />{' '}
                MacOS (<span className="game-version-depot-macos">{depotsInfo.depot_macos}</span>)
              </th>
              <th scope="col">
                {/* <svg xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true" viewBox="0 0 448 512">
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z"/>
                </svg> */}
                <FaLinux aria-hidden="true" className="icon" />{' '}
                Linux (<span className="game-version-depot-linux">{depotsInfo.depot_linux}</span>)
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(versionInfo).map(([version, info]) => {
              let name = info.long_name ?? info.name;
              if(name && info.name_suffix) {
                name = <>{name} <span className="name-suffix">{info.name_suffix}</span></>
              }
              let _manifestWindows = info.manifest_windows;
              let _manifestMac = info.manifest_macos;
              let _manifestLinux = info.manifest_linux;
              let commandCopyButtons = null;
              if(_manifestWindows || _manifestMac || _manifestLinux) {
                commandCopyButtons = <div className="cmd-copy-buttons-container">
                  <BsCopy className="icon cmd-copy-container-icon"
                    // tabIndex="0"
                    title="Show depot command copy buttons"
                    aria-label="Show depot command copy buttons"
                  />
                  {_manifestWindows && <ClipboardButtonWithPopover
                    className="cmd-copy-button"
                    text={`download_depot 1451480 ${depotsInfo.depot_windows} ${_manifestWindows}`}
                    title="Copy download depot command for Windows"
                    aria-label="Copy download depot command for Windows"
                  >
                    <BiLogoWindows className="icon" aria-hidden="true" />
                  </ClipboardButtonWithPopover>}
                  {_manifestMac && <ClipboardButtonWithPopover
                    className="cmd-copy-button"
                    text={`download_depot 1451480 ${depotsInfo.depot_macos} ${_manifestMac}`}
                    title="Copy download depot command for Mac OS"
                    aria-label="Copy download depot command for Mac OS"
                  >
                    <BiLogoApple className="icon" aria-hidden="true" />
                  </ClipboardButtonWithPopover>}
                  {_manifestLinux && <ClipboardButtonWithPopover
                    className="cmd-copy-button"
                    text={`download_depot 1451480 ${depotsInfo.depot_linux} ${_manifestLinux}`}
                    title="Copy download depot command for Linux"
                    aria-label="Copy download depot command for Linux"
                  >
                    <FaLinux className="icon" aria-hidden="true" />
                  </ClipboardButtonWithPopover>}
                </div>;
              }
              return <tr key={version}>
                <th scope="row" className="fw-normal" style={{textAlign:'start'}}>{name ?? _unknown_manifest}{commandCopyButtons}</th>
                <td>{_manifestWindows ?? _unknown_manifest}</td>
                <td>{_manifestMac ?? _unknown_manifest}</td>
                <td>{_manifestLinux ?? _unknown_manifest}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </details>
  </>;
}

export function SaveFolderLocationsList() {
  return (
    <ul className="listicons">
      <li className="listicons">
        <span className="listicons"><BiLogoWindows aria-hidden="true" className="icon" /></span>
        {/* <p>On Windows: folder "<span className="mono-text">%appdata%/../LocalLow/FishSoft/Penguin&nbsp;Heist/</span>".</p> */}
        <p>On Windows: folder "<span className="mono-text"><abbr title="%userprofile%/AppData/">%appdata%/../</abbr>LocalLow/FishSoft/Penguin&nbsp;Heist/</span>".</p>
        <p className="form-text">
          One easy way to reach this folder is to open the Run dialog box
          with <strong><BiLogoWindows title="Windows key" aria-label="Windows key" className="icon" />+R</strong>,
          enter "<span className="mono-text">%appdata%</span>" and click Ok,
          then in the file explorer window, in the address bar near the top, click "<span className="mono-text">LocalLow</span>"
          and navigate to "<span className="mono-text">FishSoft</span>" &gt; "<span className="mono-text">Penguin Heist</span>".
        </p>
      </li>
      <li className="listicons">
        <span className="listicons"><BiLogoApple aria-hidden="true" className="icon" /></span>
        <p>On Mac: folder "<span className="mono-text">~/Library/Application&nbsp;Support/FishSoft/Penguin&nbsp;Heist/</span>".</p>
        <p className="form-text">
          If you are using the file explorer and you do not see the "<span className="mono-text">Library</span>" folder in
          "<span className="mono-text">Users</span>" &gt; <span className="mono-text">your user name</span>,
          then it may be hidden. Either: hold <BsOption aria-label="option" className="icon" /> key and select Finder &gt; Go &gt; Library.
          Or, to show it, go to "View" on the menu bar and choose "Show View Options" and make sure "Show Library Folder" is checked. 
        </p>
      </li>
      <li className="listicons">
        <span className="listicons">
          <FaLinux aria-hidden="true" className="icon" />
        </span>
        <p>
          {/* <!-- $XDG_CONFIG_HOME/unity3d/  ?? --> */}
          On Linux: folder "<span className="mono-text">$HOME/.config/unity3d/Penguin&nbsp;Heist/</span>"
          <br/> or in "<span className="mono-text"><abbr title="The base Steam installation folder">&lt;Steam-folder&gt;</abbr>/steamapps/compatdata/1451480/pfx/</span>".
        </p>
        <p className="form-text">
          <BsInfoCircle aria-hidden="true" className="icon" /> This may depend on your distribution and method of installing Steam games.
        </p>
      </li>
    </ul>
  );
}

// const nothingFunction = () => {};

function ClipboardButtonWithPopover(props) {
  const { text } = props;

  const [justCopied, setJustCopied] = useState(false);
  useEffect(() => {
    if(!justCopied) return;
    let timer = setTimeout(() => {
      setJustCopied(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    }
  }, [justCopied]);

  const clickHandler = async () => {
    let result;
    try {
      result = await copy(text);
    } catch (err) {
      console.error("Error thrown by copy function", err);
    }
    if(result)
      setJustCopied(true);
    else
      alert(`Failed to copy text "${text}" to clipboard`);
  }

  return (
    <Popover isOpen={justCopied}
      positions={['top']}
      padding={1}
      // onClickOutside={nothingFunction}
      content={<div className="clipboard-success-popover">Copied!</div>}
    >
      {/* <div style={{display:'inline'}} onClick={(e)=>setJustCopied(true)}>
        {children}
      </div> */}
      <button {...props} onClick={clickHandler}>
          {props.children}
      </button>
    </Popover>
  )
}