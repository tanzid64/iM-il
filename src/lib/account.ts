import { db } from "@/server/db";
import axios from "axios";
import { syncEmailsToDatabase } from "./sync-to-db";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

const AURINKO_API_BASE_URL = "https://api.aurinko.io/v1";

class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync(daysWithin: number): Promise<SyncResponse> {
    /*
    Sync emails
    Read More: https://apirefs.aurinko.io/#tag/Messages/operation/emailAttachment
    */
    const response = await axios.post<SyncResponse>(
      `${AURINKO_API_BASE_URL}/email/sync`,
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params: {
          daysWithin,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  async createSubscription() {
    // TODO: implement subscription
  }

  async syncEmails() {
    // Get account from db based on token
    const account = await db.emailAccountProfile.findUnique({
      where: {
        token: this.token,
      },
    });

    // validate account and token
    if (!account) throw new Error("Account not found");
    if (!account.nextDeltaToken) throw new Error("No delta token found");

    // Get latest emails
    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken,
    });

    let allEmails: EmailMessage[] = response.records;
    let storedDeltaToken = account.nextDeltaToken;
    // get latest delta token if available
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }

    // fetch all emails if next page available
    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }
    if (!response) throw new Error("Failed to sync emails");

    try {
      await syncEmailsToDatabase(allEmails, account.id);
    } catch (error) {
      console.log("error", error);
    }

    // update delta token in db
    await db.emailAccountProfile.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }): Promise<SyncUpdatedResponse> {
    // console.log('getUpdatedEmails', { deltaToken, pageToken });
    let params: Record<string, string> = {};
    if (deltaToken) {
      params.deltaToken = deltaToken;
    }
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await axios.get<SyncUpdatedResponse>(
      `${AURINKO_API_BASE_URL}/email/sync/updated`,
      {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    return response.data;
  }

  async performInitialSync() {
    try {
      // Start the sync process
      const daysWithin = 3;
      let syncResponse = await this.startSync(daysWithin); // Sync emails from the last 7 days

      // Wait until the sync is ready
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        syncResponse = await this.startSync(daysWithin);
      }

      // console.log('Sync is ready. Tokens:', syncResponse);

      // Perform initial sync of updated emails
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: syncResponse.syncUpdatedToken,
      });
      // console.log('updatedResponse', updatedResponse)
      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      // console.log('Initial sync complete. Total emails:', allEmails.length);

      // Store the nextDeltaToken for future incremental syncs

      // Example of using the stored delta token for an incremental sync
      // await this.performIncrementalSync(storedDeltaToken);
      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", error);
      }
    }
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
  }) {
    try {
      const response = await axios.post(
        `${AURINKO_API_BASE_URL}/email/messages`,
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          threadId,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      console.log("sendmail", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending email:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error sending email:", error);
      }
      throw error;
    }
  }

  async getWebhooks() {
    type Response = {
      records: {
        id: number;
        resource: string;
        notificationUrl: string;
        active: boolean;
        failSince: string;
        failDescription: string;
      }[];
      totalSize: number;
      offset: number;
      done: boolean;
    };
    const res = await axios.get<Response>(`${AURINKO_API_BASE_URL}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }

  async createWebhook(resource: string, notificationUrl: string) {
    const res = await axios.post(
      `${AURINKO_API_BASE_URL}/subscriptions`,
      {
        resource,
        notificationUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  }

  async deleteWebhook(subscriptionId: string) {
    const res = await axios.delete(
      `${AURINKO_API_BASE_URL}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  }
}
type EmailAddress = {
  name: string;
  address: string;
};

export default Account;
