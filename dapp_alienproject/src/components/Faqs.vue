<template>
<div>
<h1 class="text-center mb-5">FAQ</h1>

<div class="accordion faqs" role="tablist">
    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-1 class="btn-block text-left collapsed">
            How many Aliens will be available?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>
            9999 Aliens will be minted for the public, and that’s it. Maybe there’s one extra - a special crazy alien hidden somewhere in space. <br>
            Maybe he will open the doors of the metaverse for A$$ members very soon. Who knows...
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-2 variant="info">
            What blockchain will the Aliens be minted on? 
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>The Ethereum blockchain.</b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-3 variant="info">
            How rare is each Alien, and how are traits determined?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>Each Alien is 100% unique and is programmatically generated from 220+ hand drawn traits.</b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

        <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-4 variant="info">
            Will there be a pre-sale?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>
            Yes, there will be a pre-sale for whitelisted members. This will take place on November 30, 2021 for 0.1 eth (Max 2 per whitelisted member). <br>

            Only 3000 NFT will be reserved for the pre-sale.<br>

            The first whitelist is already full, but there is a second whitelist for active community members which still has space.  
            For more information and to get on the second whitelist - check our Discord.
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-5 variant="info">
            When will the public sale go live?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>The public sale will take place on December 1, 2021.</b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-6 variant="info">
            How will the public sale work?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-6" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>
            The public sale will use the dutch auction system. <br>

            The price starts at 0.25 ETH, and drops every 6 hours, by 0.05  ETH. <br>

            The price will end at 0.15 ETH, where it will stay until the mint is sold out. 
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-7 variant="info">
           Where can I view my NFT?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-7" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>
            Once minted, you'll just need to login into your OpenSea account to view your NFTs.
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" role="tab">
        <b-button block v-b-toggle.accordion-8 variant="info">
           How can I mint my alien?
            <span class="icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse id="accordion-8" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>
            You will need a Metamask wallet or a Wallet Connect compatible wallet. <br>
            You can check our tutorials on Discord.
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>
  
  </div>
</div>
</template>

<script>
export default {
  name: 'Faqs',
      data() {
      return {
        text: '1000 spots (3 NFTs maximum per person)'
      }
    },
  props: {
    msg: String
  }
}
</script>
